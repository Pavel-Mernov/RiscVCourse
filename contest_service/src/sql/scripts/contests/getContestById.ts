const script = `

SELECT id, deadline, title, description, authorized_only
FROM contests
WHERE id = $1;

`