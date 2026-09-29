import FormInput from "components/FormInput";

import { ChildrenProps } from "./ItemScreen";

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
      helper="Alfred checks the morning forecast and suggests this jacket at or below this temperature."
      name="maxTemperature"
      value={values.maxTemperature}
      error={errors.maxTemperature}
      onChange={onChange}
      onBlur={onBlur}
      // No inputMode: iPhone's numeric keypad has no minus for cold days
      type="number"
      suffix="°C"
      placeholder="e.g. 18"
      isReadOnly={mode === "view"}
    />
  );
};

export default JacketsForm;
