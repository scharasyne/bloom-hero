--this is for record, a function to insert auth users to public schema users

--creates/updates the function (the code logic).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  RETURN NEW;
END;
$$;

--creates the trigger to add auth.users to public.users
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();



--for record only - make the shop_name nullable
ALTER TABLE vendors ALTER COLUMN shop_name DROP NOT NULL;
