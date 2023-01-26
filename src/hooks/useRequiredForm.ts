import { useState, useEffect, ChangeEvent, FocusEvent } from "react";

export type Errors = {
  [key: string]: string | null;
};

export type RequiredFromReturn<T extends Record<string, unknown>> = {
  values: T;
  errors: Errors;
  onChange: ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: ({ target: { name } }: FocusEvent<HTMLInputElement>) => void;
  setFieldValue: (name: keyof T, value: unknown) => void;
  setFieldTouched: (name: keyof T) => void;
  setFormValues: (values: T) => void;
  destroyForm: () => void;
  reInitializeForm: (values: T) => void;
  isValid: boolean;
  handleSubmit: () => Promise<T>;
};

const useRequiredForm = <T extends Record<string, unknown>>(
  initialFormValue: T
): RequiredFromReturn<T> => {
  const [initialValues, setInitialValues] = useState(initialFormValue);
  const [values, setValues] = useState(initialFormValue);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, unknown>>>({});
  const [isValid, setValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [values, touched]);

  function onChange({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setValues({ ...values, [name]: value });
  }

  function onBlur({ target: { name } }: FocusEvent<HTMLInputElement>) {
    setFieldTouched(name);
  }

  function reInitializeForm(values: T) {
    setInitialValues(values);
  }

  function destroyForm() {
    setValues(initialValues);
    setTouched({});
    setErrors({});
  }

  function handleSubmit() {
    return new Promise<T>((resolve) => {
      touchForm();

      const isFormValid = validateForm();
      if (isFormValid) resolve(values);
    });
  }

  function setFieldValue(name: keyof T, value: unknown) {
    setValues({ ...values, [name]: value });
  }

  function setFormValues(values: T) {
    setValues(values);
  }

  function setFieldTouched(name: keyof T) {
    if (!touched[name]) {
      setTouched({ ...touched, [name]: true });
    }
  }

  function touchForm() {
    for (const name in values) {
      touched[name] = true;
    }

    setTouched({ ...touched });
  }

  function validateForm() {
    const validationErrors = { ...errors };
    let isFormValid = true;

    for (const name in values) {
      if (!values[name] && touched[name]) {
        isFormValid = false;
        validationErrors[name] = `${name} is a required field`;
      } else {
        validationErrors[name] = null;
      }
    }

    setErrors(validationErrors);
    setValid(isFormValid);
    return isFormValid;
  }

  return {
    values,
    errors,
    onChange,
    onBlur,
    setFieldValue,
    setFieldTouched,
    setFormValues,
    destroyForm,
    reInitializeForm,
    isValid,
    handleSubmit,
  };
};

export default useRequiredForm;
