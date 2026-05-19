/*
  Admin RPC functions — credentials enforced in the database.
  Run this in Supabase Dashboard → SQL Editor if admin add/delete fails.
*/

CREATE OR REPLACE FUNCTION admin_add_person(
  p_username text,
  p_password text,
  p_name text
)
RETURNS people
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result people;
BEGIN
  IF p_username IS DISTINCT FROM 'ADMIN' OR p_password IS DISTINCT FROM '1234554321' THEN
    RAISE EXCEPTION 'Invalid credentials' USING ERRCODE = '42501';
  END IF;

  INSERT INTO people (name) VALUES (trim(p_name)) RETURNING * INTO result;
  RETURN result;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Person already exists' USING ERRCODE = '23505';
END;
$$;

CREATE OR REPLACE FUNCTION admin_delete_person(
  p_username text,
  p_password text,
  p_person_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_username IS DISTINCT FROM 'ADMIN' OR p_password IS DISTINCT FROM '1234554321' THEN
    RAISE EXCEPTION 'Invalid credentials' USING ERRCODE = '42501';
  END IF;

  DELETE FROM people WHERE id = p_person_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_add_person(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_person(text, text, uuid) TO anon, authenticated;
