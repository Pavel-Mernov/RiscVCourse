import axios from "axios";
import type { RequestHandler } from "express";
import { CLIENT_ID, CLIENT_SECRET, KEYCLOAK_URL, REALM } from "../env";

const STUDENT_EMAIL_DOMAIN = "@edu.hse.ru";

interface KeycloakUser {
  email?: string | null;
  [key: string]: unknown;
}

const getAdminAccessToken = async () => {
  const response = await axios.post(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
    new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return response.data.access_token as string;
};

const getStudents: RequestHandler = async (req, res) => {
  const authorization = req.headers.authorization;

  if (!authorization?.trim()) {
    res.status(401).json({ error: "Authorization header is required" });
    return;
  }

  try {
    const adminAccessToken = await getAdminAccessToken();

    console.log(adminAccessToken)

    const users: KeycloakUser[] = [];
    const max = 100;
    let first = 0;

    for (;;) {
      const response = await axios.get(
        `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
        {
          headers: {
            Authorization: `Bearer ${adminAccessToken}`,
          },
          params: {
            first,
            max,
          },
        }
      );

      const batch = Array.isArray(response.data) ? (response.data as KeycloakUser[]) : [];
      users.push(...batch);

      if (batch.length < max) {
        break;
      }

      first += max;
    }

    const students = users.filter((user) =>
      typeof user.email === "string" &&
      user.email.toLowerCase().endsWith(STUDENT_EMAIL_DOMAIN)
    );

    res.json(students);
  } catch (error) {
    const details = axios.isAxiosError(error) ? error.response?.data ?? error.message : String(error);

    console.log(JSON.stringify(details))

    res.status(500).json({
      error: "Failed to load students from Keycloak",
      details,
    });
  }
};

const getUserByEmail: RequestHandler = async (req, res) => {
  const { email } = req.params;
  const authorization = req.headers.authorization;

  if (!authorization?.trim()) {
    res.status(401).json({ error: "Authorization header is required" });
    return;
  }

  try {
    const adminAccessToken = await getAdminAccessToken();

    const response = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
      {
        headers: {
          Authorization: `Bearer ${adminAccessToken}`,
        },
        params: {
          email,
        },
      }
    );

    const [user] = Array.isArray(response.data) ? response.data : [];

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    const details = axios.isAxiosError(error) ? error.response?.data ?? error.message : String(error);

    console.log(JSON.stringify(details))

    res.status(500).json({
      error: "Failed to load user from Keycloak",
      details,
    });
  }
};


export default {
  getStudents,
  getUserByEmail,
};
