CREATE FUNCTION public.lidar_com_novo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.perfis (id, username, papel)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    'usuario'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.lidar_com_novo_usuario();
