import React from "react";
import { useSelector } from "react-redux";
import "./progress-bar.css";

interface AppState {
  progressBarReducer: {
    requestsInProgress: number; // Property to track the number of active requests in the progress bar reducer.
  };
}

/**
 * This component represents a progress bar and will be displayed based on the number of active requests. */
const ProgressBar: React.FC = () => {
  /* The useSelector hook from the react-redux library is used. This hook allows the component to “subscribe” to state
   changes in the Redux store and retrieve the necessary data from it. In this case, the requestsInProgress value is
   retrieved from the Redux state.*/

  // Using the useSelector hook to extract the 'requestsInProgress' value from the application state.
  const requestsInProgress = useSelector(
    (state: AppState) => state.progressBarReducer.requestsInProgress,
  );

  // Rendering the progress bar with dynamic opacity based on the number of active requests.
  return (
    <div
      className="progress-bar"
      style={{
        opacity: requestsInProgress > 0 ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      Loading
      <div className="progress-bar__spinner"></div>
    </div>
  );
};

export default ProgressBar;
