import FormInput from "components/FormInput";

import { ChildrenProps } from "./WardrobeItem";

const JacketsForm = ({
  mode,
  values,
  errors,
  onChange,
  onBlur,
}: ChildrenProps) => {
  return (
    <FormInput
      label="Suggest when it's this cool or cooler"
      name="maxTemperature"
      value={values.maxTemperature}
      error={errors.maxTemperature}
      onChange={onChange}
      onBlur={onBlur}
      type="number"
      inputMode="numeric"
      suffix="°C"
      isReadOnly={mode === "view"}
    />
  );
};

export default JacketsForm;
