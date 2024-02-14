import { useForm } from "react-hook-form";
import "./validated-input.css";
import React from "react";

interface ValidatedInputProps {
  className?: string;
  previousValue?: string;
  onLostFocus?: (inputValue: string | null) => void; // Callback for handling lost focus event
  onEnter?: (inputValue: string) => void; // Callback for handling enter key press event
  checkValid?: (valid: boolean) => void; // Callback for checking validity status
}

function ValidatedInput({
  className,
  previousValue,
  onLostFocus,
  onEnter,
  checkValid,
}: ValidatedInputProps) {
  const {
    register,
    formState: { errors, isValid },
    getValues,
  } = useForm({
    mode: "onChange",
  });

  // Check if a validation callback is provided and invoke it with the current validity state
  if (checkValid) {
    checkValid(isValid);
  }

  /**
   * Handle key press events, triggering onEnter callback when the Enter key is pressed.
   *
   * @param event The key press event.
   */
  function handleKeyPress(event: any) {
    const inputValue = getValues("form"); // Retrieve the current form input value
    // Check if the input is valid and Enter key is pressed, then invoke onEnter callback
    if (isValid && event.key === "Enter" && onEnter) {
      // Invoke the onEnter callback with the current input value. It allows for further processing or handling of the entered data.
      onEnter(inputValue);
    }
  }

  /**
   * Handle the loss of focus on the input, triggering onLostFocus callback.
   */
  function handleLostFocus() {
    // If input is valid, invoke onLostFocus with the current input value; otherwise, pass null
    if (onLostFocus) {
      if (isValid) {
        const inputValue = getValues("form"); // Retrieve the current form input value
        // Invoke the onLostFocus callback with the current input value. It allows for further processing or handling of the entered data.
        onLostFocus(inputValue);
      } else {
        onLostFocus(null);
      }
    }
  }

  /**
   * Define error messages for different validation types. Retrieves an error message based on the specified validation type.
   * @param type The validation type for which the error message is requested.
   * @returns The corresponding error message for the given validation type.
   */
  function getErrorMessage(type: string) {
    // Define the structure of error messages for various validation types.
    interface ErrorMessages {
      required: string;
      minLength: string;
      maxLength: string;
      pattern: string;
      validate: string;
      [key: string]: string;
    }
    // Error messages for different validation types
    const errorMessages: ErrorMessages = {
      required: "Required field",
      minLength: "Minimum length - 2 characters",
      maxLength: "Maximum length - 30 characters",
      pattern: "Invalid character",
      validate: "Only spaces is invalid",
    };
    // Return the error message corresponding to the specified validation type, or an empty string if not found
    return errorMessages[type] || "";
  }

  return (
    <div className="validated-input__wrapper">
      <input
        className={`validated-input__input ${className}`}
        defaultValue={previousValue}
        {...register("form", {
          required: true,
          minLength: 2,
          maxLength: 30,
          pattern: /^[а-яa-zА-ЯA-Z0-9_\s.-]*$/,
          validate: (value) => value.trim().length > 0,
        })}
        onBlur={handleLostFocus}
        onKeyDown={handleKeyPress}
        aria-invalid={errors.form ? "true" : "false"}
        autoFocus
      />
      {/* Display error message if there are validation errors */}
      {errors.form?.type && (
        <div className="validated-input__errors">
          {getErrorMessage(errors.form.type as string)}
        </div>
      )}
    </div>
  );
}

/*By defining these PropTypes, the code ensures that the component receives the expected types for its props.*/
// ValidatedInput.propTypes = {
//   onLostFocus: PropTypes.func,
//   onEnter: PropTypes.func,
//   className: PropTypes.string,
//   previousValue: PropTypes.string,
//   checkValid: PropTypes.func,
// };

export default ValidatedInput;
