/*
# TransitOps – Auth trigger for auto profile creation

1. Changes
- Creates a trigger function `handle_new_user` that inserts a row into `profiles` when a new auth user is created.
- Attaches the trigger to `auth.users` so every signup automatically gets a profile row.
2. Security
- The function runs with security definer privileges to insert into profiles.
3. Notes
- Default role is 'Driver' (least privilege) until an admin assigns a different role.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    (SELECT id FROM public.roles WHERE name = 'Driver')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
