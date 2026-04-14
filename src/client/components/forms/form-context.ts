import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useContext } from "react";
import { FormInput } from "./form-input";
import { FormPassword } from "./form-password";

export const { fieldContext, formContext } = createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    Password: FormPassword,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFieldContext<T = any>(): any {
  return useContext(fieldContext);
}
