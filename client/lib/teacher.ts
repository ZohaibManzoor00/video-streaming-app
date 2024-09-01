import useAuth from "@/app/hooks/useAuth";

export const useIsTeacher = () => {
  const { user } = useAuth();
  const isVerified = user?.email?.endsWith("@marcylabschool.org");
  return isVerified;
};
