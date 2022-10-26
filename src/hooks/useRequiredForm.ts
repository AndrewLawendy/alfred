import { useState, useEffect, ChangeEvent, FocusEvent } from "react";

export type Values = {
  [key: string]: string;
};

export type Errors = {
  [key: string]: string | null;
};

type Touched = { [key: string]: boolean };

const useRequiredForm = (initialFormValue: Values) => {
  const [initialValues, setInitialValues] = useState(initialFormValue);
  const [values, setValues] = useState(initialFormValue);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
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

  function reInitializeForm(values: Values) {
    setInitialValues(values);
  }

  function destroyForm() {
    setValues(initialValues);
    setTouched({});
    setErrors({});
  }

  function handleSubmit(cb: (values: Values) => void) {
    touchForm();

    const isFormValid = validateForm();
    if (isFormValid) cb(values);
  }

  function setFieldValue(name: string, value: string) {
    setValues({ ...values, [name]: value });
  }

  function setFieldTouched(name: string) {
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
    destroyForm,
    reInitializeForm,
    isValid,
    handleSubmit,
  };
};

export default useRequiredForm;
