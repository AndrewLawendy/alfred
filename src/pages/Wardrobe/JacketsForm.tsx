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
      label="Maximum Temperature in Celsius"
      name="maxTemperature"
      value={values.maxTemperature}
      error={errors.maxTemperature}
      onChange={onChange}
      onBlur={onBlur}
      type="number"
      isReadOnly={mode === "view"}
    />
  );
};

export default JacketsForm;
