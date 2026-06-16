// src/components/SliderField.jsx
// Accessible slider input with ARIA labels, value display, and category tooltips.
// Handles the 3 field types: binary (0/1), range (0-1), and credit load (0-28).

import React from 'react';
import './SliderField.css';

// Human-readable labels + descriptions for each feature
const FIELD_META = {
  Family_History: {
    label: 'Family History',
    description: 'Do you have a family history of mental health issues?',
    valueLabels: { 0: 'No', 1: 'Yes' },
    category: 'Background',
  },
  Social_Support: {
    label: 'Social Support',
    description: 'Quality of your social support network',
    valueLabels: { 0: 'Very Low', 0.5: 'Moderate', 1: 'Very High' },
    category: 'Wellbeing',
  },
  Counseling_Service_Use: {
    label: 'Counseling Use',
    description: 'How often you use counseling services',
    valueLabels: { 0: 'Never', 0.5: 'Sometimes', 1: 'Regularly' },
    category: 'Support',
  },
  Extracurricular_Involvement: {
    label: 'Extracurricular Activity',
    description: 'Level of involvement in extracurricular activities',
    valueLabels: { 0: 'None', 0.5: 'Moderate', 1: 'Very Active' },
    category: 'Lifestyle',
  },
  Semester_Credit_Load: {
    label: 'Credit Load',
    description: 'Number of credits enrolled this semester',
    category: 'Academic',
  },
  Sleep_Quality: {
    label: 'Sleep Quality',
    description: 'How well you sleep on average',
    valueLabels: { 0: 'Very Poor', 0.5: 'Fair', 1: 'Excellent' },
    category: 'Lifestyle',
  },
  Physical_Activity: {
    label: 'Physical Activity',
    description: 'Frequency of physical exercise',
    valueLabels: { 0: 'Sedentary', 0.5: 'Moderate', 1: 'Very Active' },
    category: 'Lifestyle',
  },
  Stress_Level: {
    label: 'Stress Level',
    description: 'Your current perceived stress level',
    valueLabels: { 0: 'Very Low', 0.5: 'Moderate', 1: 'Extreme' },
    category: 'Wellbeing',
  },
  Financial_Stress: {
    label: 'Financial Stress',
    description: 'Level of financial pressure or worry',
    valueLabels: { 0: 'None', 0.5: 'Moderate', 1: 'Severe' },
    category: 'Wellbeing',
  },
  Substance_Use: {
    label: 'Substance Use',
    description: 'Frequency of alcohol/substance use',
    valueLabels: { 0: 'Never', 0.5: 'Occasionally', 1: 'Frequently' },
    category: 'Lifestyle',
  },
  Diet_Quality: {
    label: 'Diet Quality',
    description: 'Overall quality of your daily diet',
    valueLabels: { 0: 'Very Poor', 0.5: 'Adequate', 1: 'Excellent' },
    category: 'Lifestyle',
  },
  Depression_Score: {
    label: 'Depression Score',
    description: 'Self-reported level of depressive symptoms',
    valueLabels: { 0: 'None', 0.5: 'Moderate', 1: 'Severe' },
    category: 'Mental Health',
  },
  Anxiety_Score: {
    label: 'Anxiety Score',
    description: 'Self-reported level of anxiety symptoms',
    valueLabels: { 0: 'None', 0.5: 'Moderate', 1: 'Severe' },
    category: 'Mental Health',
  },
  Chronic_Illness: {
    label: 'Chronic Illness',
    description: 'Do you have a chronic physical illness?',
    valueLabels: { 0: 'No', 1: 'Yes' },
    category: 'Background',
  },
};

const CATEGORY_COLORS = {
  Background:    'var(--color-info)',
  Wellbeing:     'var(--color-warning)',
  Support:       'var(--color-success)',
  Lifestyle:     'var(--color-secondary)',
  Academic:      'var(--color-primary)',
  'Mental Health': 'var(--color-danger)',
};

const SliderField = ({ fieldKey, value, onChange }) => {
  const meta = FIELD_META[fieldKey] || {
    label: fieldKey.replace(/_/g, ' '),
    description: '',
    category: 'Other',
  };

  // Determine slider bounds
  const isCredit = fieldKey === 'Semester_Credit_Load';
  const isBinary = ['Family_History', 'Chronic_Illness'].includes(fieldKey);
  const isHalfStep = [
    'Social_Support', 'Counseling_Service_Use', 'Extracurricular_Involvement',
    'Sleep_Quality', 'Physical_Activity', 'Substance_Use',
  ].includes(fieldKey);

  const min  = 0;
  const max  = isCredit ? 28 : 1;
  const step = isCredit ? 1 : isBinary ? 1 : isHalfStep ? 0.5 : 0.01;

  // Build the human-readable value text for ARIA
  const getDisplayValue = () => {
    if (isCredit) return `${value} credits`;
    if (meta.valueLabels) {
      const closest = Object.keys(meta.valueLabels)
        .map(Number)
        .reduce((a, b) => Math.abs(b - value) < Math.abs(a - value) ? b : a);
      return meta.valueLabels[closest];
    }
    return `${Math.round(value * 100)}%`;
  };

  const percentage = isCredit ? (value / 28) * 100 : value * 100;
  const catColor = CATEGORY_COLORS[meta.category] || 'var(--color-primary)';

  return (
    <div className="slider-field">
      <div className="slider-field__header">
        <div className="slider-field__label-row">
          <span
            className="slider-field__category"
            style={{ color: catColor, borderColor: catColor }}
          >
            {meta.category}
          </span>
          <label
            htmlFor={`slider-${fieldKey}`}
            className="slider-field__label"
            title={meta.description}
          >
            {meta.label}
          </label>
        </div>
        <span className="slider-field__value" aria-live="polite">
          {getDisplayValue()}
        </span>
      </div>

      {meta.description && (
        <p className="slider-field__description">{meta.description}</p>
      )}

      <div className="slider-field__track-wrapper">
        <input
          id={`slider-${fieldKey}`}
          type="range"
          name={fieldKey}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="slider-field__input"
          aria-label={meta.label}
          aria-valuetext={getDisplayValue()}
          aria-describedby={meta.description ? `desc-${fieldKey}` : undefined}
          style={{ '--fill-pct': `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default SliderField;
