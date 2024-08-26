import useAuth from "@/app/hooks/useAuth";

export const isTeacher = () => {
  const { user } = useAuth();
  const isVerified = user?.email?.endsWith("@marcylabschool.org");
  return isVerified;
};
