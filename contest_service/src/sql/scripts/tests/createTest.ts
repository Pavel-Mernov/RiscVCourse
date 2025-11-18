const query = `

INSERT INTO tests (
  id, task_id, input, expected_output
) VALUES (
  $1, $2, $3, $4
);

`