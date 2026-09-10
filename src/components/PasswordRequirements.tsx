import { Check, X } from "lucide-react";
import {
  arePasswordRequirementsMet,
  type PasswordRequirementsState,
} from "@/utils/passwordRequirements";

const REQUIREMENT_ITEMS: Array<{
  key: keyof PasswordRequirementsState;
  label: string;
}> = [
  { key: "minLength", label: "Al menos 8 caracteres" },
  { key: "hasUppercase", label: "Una letra mayúscula" },
  { key: "hasLowercase", label: "Una letra minúscula" },
  { key: "hasNumber", label: "Al menos un número" },
  { key: "hasSpecialChar", label: "Un carácter especial (!@#$%^&*)" },
];

export const PasswordRequirements = ({
  passwordRequirements,
}: {
  passwordRequirements: PasswordRequirementsState;
}) => {
  const allMet = arePasswordRequirementsMet(passwordRequirements);

  return (
    <div
      className={`mt-3 p-3 bg-muted/50 rounded-lg border ${
        allMet ? "border-green-500" : "border-border"
      }`}
    >
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Requisitos de la contraseña:
      </p>
      <div className="space-y-1">
        {REQUIREMENT_ITEMS.map(({ key, label }) => {
          const met = passwordRequirements[key];
          return (
            <div key={key} className="flex items-center space-x-2">
              {met ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <X className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`text-xs ${
                  met
                    ? "text-green-700 dark:text-green-400"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
