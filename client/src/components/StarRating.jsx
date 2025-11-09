// src/components/StarRating.jsx
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";

/**
 * StarRating
 *
 * Props:
 * - roomId: string | number (optional) — passed back in onRate callback
 * - value: number (optional) — average rating to display (1-5)
 * - totalReviews: number (optional) — number of reviews (for "avg display")
 * - userRating: number (optional) — if the current user already rated (1-5)
 * - onRate: function(roomId, rating) => void (optional) — called when user clicks a star (B2a)
 * - size: number (optional) — star icon size in px (default 20)
 * - readOnly: boolean (optional) — if true, disables interactive rating (still shows avg)
 *
 * Behaviour:
 * - Interactive (unless readOnly). Hover shows preview. Click emits onRate(roomId, rating).
 * - Keyboard accessible (Left/Right arrows + Enter to submit).
 * - Displays numeric average if value is provided (e.g. "4.3").
 */

const Star = ({ filled, size = 20, ariaLabel }) => {
  // Gold fill for filled, outline for empty
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`star-icon ${filled ? "text-amber-400" : "text-amber-300"}`}
      aria-hidden="true"
      focusable="false"
      role="img"
      aria-label={ariaLabel}
    >
      {/* Path for star */}
      <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.556L19.8 24 12 19.897 4.2 24l1.998-8.694L.5 9.75l7.732-1.732L12 .587z" />
    </svg>
  );
};

const clamp = (v) => Math.max(0, Math.min(5, v));

const StarRating = ({
  roomId = null,
  value = 0,
  totalReviews = 0,
  userRating = 0,
  onRate = () => {},
  size = 20,
  readOnly = false,
}) => {
  const [hoverValue, setHoverValue] = useState(0);
  const [currentValue, setCurrentValue] = useState(
    userRating || Math.round(value || 0)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // keep internal currentValue in sync if props change (controlled-ish)
  useEffect(() => {
    if (userRating) {
      setCurrentValue(userRating);
    } else if (value) {
      // display nearest integer for stars while showing fractional avg next to it
      setCurrentValue(Math.round(value));
    } else {
      setCurrentValue(0);
    }
  }, [value, userRating]);

  const handleMouseEnter = (val) => {
    if (readOnly) return;
    setHoverValue(val);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(0);
  };

  const handleClick = async (val) => {
    if (readOnly) return;
    // optimistic UI: set local state and emit callback
    setCurrentValue(clamp(val));
    setIsSubmitting(true);
    try {
      // B2a architecture: just emit upward, parent will handle API with axios
      await Promise.resolve(onRate(roomId, val));
    } catch (err) {
      // If parent throws or returns rejected promise, we could revert - but leave handling to parent
      console.error("onRate handler error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // keyboard support: left/right to adjust preview, Enter to submit
  const handleKeyDown = useCallback(
    (e) => {
      if (readOnly) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setHoverValue((hv) => (hv > 1 ? hv - 1 : 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setHoverValue((hv) => (hv < 5 ? hv + 1 : 5));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const ratingToSubmit = hoverValue || currentValue || 1;
        handleClick(ratingToSubmit);
      }
    },
    [hoverValue, currentValue, readOnly]
  );

  // Effective displayed stars: hoverValue > 0 ? hoverValue : currentValue
  const displayed = hoverValue || currentValue;

  return (
    <div
      className="flex items-center gap-2"
      onKeyDown={handleKeyDown}
      tabIndex={readOnly ? -1 : 0}
      role="group"
      aria-label="Star rating"
    >
      <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= displayed;
          const isInteractive = !readOnly;
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => handleMouseEnter(i)}
              onFocus={() => handleMouseEnter(i)}
              onBlur={handleMouseLeave}
              onClick={() => handleClick(i)}
              disabled={isSubmitting || readOnly}
              aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
              className={`p-0 m-0 transition-transform duration-150 ease-in-out ${
                isInteractive
                  ? "cursor-pointer hover:scale-110"
                  : "cursor-default"
              } ${isSubmitting ? "opacity-70" : "opacity-100"}`}
              style={{ lineHeight: 0 }}
            >
              <Star filled={filled} size={size} ariaLabel={`${i} star`} />
            </button>
          );
        })}
      </div>

      {/* Average numeric display */}
      {typeof value === "number" && value > 0 && (
        <div className="text-sm font-medium text-gray-700 select-none">
          <span className="mr-1">
            {(Math.round(value * 10) / 10).toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">({totalReviews || 0})</span>
        </div>
      )}
    </div>
  );
};

StarRating.propTypes = {
  roomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.number,
  totalReviews: PropTypes.number,
  userRating: PropTypes.number,
  onRate: PropTypes.func,
  size: PropTypes.number,
  readOnly: PropTypes.bool,
};

export default StarRating;
