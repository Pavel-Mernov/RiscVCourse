const script = `

SELECT id, deadline, title, description
FROM contests
WHERE id = $1;

`