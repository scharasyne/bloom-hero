--this is for record, a function to insert auth users to public schema users

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

--this is a trigger to add to vendor table according to vendor type
CREATE OR REPLACE FUNCTION public.handle_new_vendor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.vendors(id)
  VALUES (NEW.id)

  RETURN NEW
END
$$;
