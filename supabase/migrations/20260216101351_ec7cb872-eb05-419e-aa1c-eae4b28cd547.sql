ALTER TABLE public.user_loto_foot_grids
  ADD CONSTRAINT user_loto_foot_grids_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);