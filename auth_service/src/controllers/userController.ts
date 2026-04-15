import axios from "axios";
import type { RequestHandler } from "express";
import { KEYCLOAK_URL, REALM } from "../env";

const STUDENT_EMAIL_DOMAIN = "@edu.hse.ru";

interface KeycloakUser {
  email?: string | null;
  [key: string]: unknown;
}

const getStudents: RequestHandler = async (req, res) => {
  const authorization = req.headers.authorization;

  if (!authorization?.trim()) {
    res.status(401).json({ error: "Authorization header is required" });
    return;
  }

  try {
    const users: KeycloakUser[] = [];
    const max = 100;
    let first = 0;

    for (;;) {
      const response = await axios.get(
        `${KEYCLOAK_URL}/admin/realms/${REALM}/users`,
        {
          headers: {
            Authorization: authorization,
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
    res.status(500).json({
      error: "Failed to load students from Keycloak",
      details: axios.isAxiosError(error) ? error.response?.data ?? error.message : String(error),
    });
  }
};

export default {
  getStudents,
};
