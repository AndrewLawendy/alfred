import { useState, useEffect, useRef, ChangeEvent, FocusEvent } from "react";

export type Errors = {
  [key: string]: string | null;
};

export type FromReturn<T extends Record<string, unknown>> = {
  values: { [key in keyof T]: string };
  errors: Errors;
  onChange: ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: ({ target: { name } }: FocusEvent<HTMLInputElement>) => void;
  setFieldValue: (name: keyof T, value: unknown) => void;
  setFieldTouched: (name: keyof T) => void;
  setFormValues: (values: { [key in keyof T]: string }) => void;
  destroyForm: () => void;
  reInitializeForm: (values: { [key in keyof T]: string }) => void;
  isValid: boolean;
  handleSubmit: () => Promise<{ [key in keyof T]: string }>;
};

export type FormConfig = {
  [fieldName: string]: {
    initialValue: string;
    isRequired?: boolean;
  };
};

export type FormValue = {
  [fieldName: string]: string;
};

export const useForm = <T extends FormConfig>(
  initialForm: T
): FromReturn<T> => {
  const initialFormValueRef = useRef(
    (
      Object.entries(initialForm) as [
        keyof T,
        {
          initialValue: string;
          isRequired?: boolean;
        }
      ][]
    ).reduce((formValues, [fieldName, config]) => {
      formValues[fieldName] = config.initialValue;

      return formValues;
    }, {} as { [key in keyof T]: string })
  );
  const [initialValues, setInitialValues] = useState(
    initialFormValueRef.current
  );
  const [values, setValues] = useState(initialFormValueRef.current);
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

  function reInitializeForm(values: { [name in keyof T]: string }) {
    setInitialValues(values);
  }

  function destroyForm() {
    setValues(initialValues);
    setTouched({});
    setErrors({});
  }

  function handleSubmit() {
    return new Promise<{ [name in keyof T]: string }>((resolve) => {
      touchForm();

      const isFormValid = validateForm();
      if (isFormValid) resolve(values);
    });
  }

  function setFieldValue(name: keyof T, value: unknown) {
    setValues({ ...values, [name]: value });
  }

  function setFormValues(values: { [name in keyof T]: string }) {
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
      if (!values[name] && touched[name] && initialForm[name].isRequired) {
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

export default useForm;
