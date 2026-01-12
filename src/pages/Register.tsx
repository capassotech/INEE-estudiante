import AuthFormController from "@/components/AuthForm/AuthFormController";
import EnvironmentBanner from "@/components/EnvironmentBanner";


const Register = () => {
  return (
    <>
      <EnvironmentBanner />
      <AuthFormController />
    </>
  );
};

export default Register;