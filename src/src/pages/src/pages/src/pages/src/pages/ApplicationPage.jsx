import React, { useEffect, useState } from "react";
import ProgressTracker from "../components/ProgressTracker";

const STUDY_FIELDS = {
  "Medicine & Health": [
    "Medicine",
    "Dentistry",
    "Pharmacy",
    "Nursing",
    "Physiotherapy",
    "Nutrition & Dietetics",
  ],

  Engineering: [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical & Electronics Engineering",
    "Industrial Engineering",
    "Architecture",
  ],

  "Computer Science & IT": [
    "Computer Engineering",
    "Software Engineering",
    "Artificial Intelligence",
    "Information Technology",
    "Cyber Security",
  ],

  "Business & Economics": [
    "Business Administration",
    "International Business",
    "Economics",
    "Finance",
    "Accounting",
    "Marketing",
  ],

  "Law & Social Sciences": [
    "Law",
    "International Relations",
    "Political Science",
    "Psychology",
    "Sociology",
  ],
};

const UNIVERSITIES = [
  "Istanbul Aydin University",
  "Istanbul Gelisim University",
  "Istinye University",
];

export default function ApplicationPage({
  application,
  applicationId,
  currentStage = 2,
  onSave,
  onContinue,
}) {
  const [field, setField] = useState(
    application?.field || ""
  );

  const [specialization, setSpecialization] =
    useState(application?.specialization || "");

  const [university, setUniversity] = useState(
    application?.university || ""
  );

  const [openMenu, setOpenMenu] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setField(application?.field || "");
    setSpecialization(
      application?.specialization || ""
    );
    setUniversity(
      application?.university || ""
    );
  }, [application]);

  useEffect(() => {
    if (!field) {
      setSpecialization("");
      setUniversity("");
      return;
    }

    const availableSpecializations =
      STUDY_FIELDS[field] || [];

    if (
      specialization &&
      !availableSpecializations.includes(
        specialization
      )
    ) {
      setSpecialization("");
      setUniversity("");
    }
  }, [field]);

  useEffect(() => {
    let cancelled = false;

    const save = async () => {
      if (!field && !specialization && !university) {
        return;
      }

      setSaving(true);
      setSaved(false);

      try {
        await onSave?.({
          field,
          specialization,
          university,
          stage:
            field &&
            specialization &&
            university
              ? "documents"
              : "choose",
        });

        if (!cancelled) {
          setSaved(true);
        }
      } catch (error) {
        console.error(
          "Application auto-save failed:",
          error
        );
      } finally {
        if (!cancelled) {
          setSaving(false);
        }
      }
    };

    const timer = setTimeout(save, 700);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    field,
    specialization,
    university,
    onSave,
  ]);

  const handleFieldChange = (value) => {
    setField(value);
    setSpecialization("");
    setUniversity("");
    setOpenMenu(null);
  };

  const handleSpecializationChange = (value) => {
    setSpecialization(value);
    setUniversity("");
    setOpenMenu(null);
  };

  const handleUniversityChange = (value) => {
    setUniversity(value);
    setOpenMenu(null);
  };

  const ready =
    Boolean(field) &&
    Boolean(specialization) &&
    Boolean(university);

  const specializations =
    STUDY_FIELDS[field] || [];

  const getDisplayValue = (
    value,
    placeholder
  ) => {
    return value || placeholder;
  };

  return (
    <main className="application-page">
      <section className="application-header">
        <div>
          <span className="eyebrow">
            STEP 02 · CHOOSE
          </span>

          <h1>
            Build your university choice.
          </h1>

          <p>
            Select your study field,
            specialization, and preferred
            university.
          </p>
        </div>

        <div className="application-id-card">
          <span>Application ID</span>

          <strong>
            {applicationId ||
              application?.applicationNumber ||
              "—"}
          </strong>
        </div>
      </section>

      <section className="application-progress">
        <ProgressTracker
          currentStage={currentStage}
        />
      </section>

      <section className="application-form-section">
        <div className="application-form-card">
          <div className="form-card-header">
            <span className="step-number">
              01
            </span>

            <div>
              <h2>Study field</h2>

              <p>
                What area would you like to study?
              </p>
            </div>
          </div>

          <div className="custom-select-wrapper">
            <button
              type="button"
              className={`custom-select ${
                openMenu === "field"
                  ? "open"
                  : ""
              }`}
              onClick={() =>
                setOpenMenu(
                  openMenu === "field"
                    ? null
                    : "field"
                )
              }
            >
              <span
                className={
                  field
                    ? "selected-value"
                    : "placeholder-value"
                }
              >
                {getDisplayValue(
                  field,
                  "Select your study field"
                )}
              </span>

              <span className="select-arrow">
                {openMenu === "field"
                  ? "▲"
                  : "▼"}
              </span>
            </button>

            {openMenu === "field" && (
              <div className="custom-options">
                {Object.keys(
                  STUDY_FIELDS
                ).map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={
                      field === item
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      handleFieldChange(item)
                    }
                  >
                    <span>{item}</span>

                    {field === item && (
                      <span>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className={`application-form-card ${
            !field ? "disabled-card" : ""
          }`}
        >
          <div className="form-card-header">
            <span className="step-number">
              02
            </span>

            <div>
              <h2>Specialization</h2>

              <p>
                Choose the specific program you
                want to study.
              </p>
            </div>
          </div>

          <div className="custom-select-wrapper">
            <button
              type="button"
              className={`custom-select ${
                openMenu === "specialization"
                  ? "open"
                  : ""
              }`}
              disabled={!field}
              onClick={() =>
                setOpenMenu(
                  openMenu === "specialization"
                    ? null
                    : "specialization"
                )
              }
            >
              <span
                className={
                  specialization
                    ? "selected-value"
                    : "placeholder-value"
                }
              >
                {field
                  ? getDisplayValue(
                      specialization,
                      "Select your specialization"
                    )
                  : "Select a study field first"}
              </span>

              <span className="select-arrow">
                {openMenu === "specialization"
                  ? "▲"
                  : "▼"}
              </span>
            </button>

            {openMenu === "specialization" &&
              field && (
                <div className="custom-options">
                  {specializations.map(
                    (item) => (
                      <button
                        type="button"
                        key={item}
                        className={
                          specialization ===
                          item
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          handleSpecializationChange(
                            item
                          )
                        }
                      >
                        <span>{item}</span>

                        {specialization ===
                          item && (
                          <span>✓</span>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
          </div>
        </div>

        <div
          className={`application-form-card ${
            !specialization
              ? "disabled-card"
              : ""
          }`}
        >
          <div className="form-card-header">
            <span className="step-number">
              03
            </span>

            <div>
              <h2>University</h2>

              <p>
                Choose where you want to submit
                your application.
              </p>
            </div>
          </div>

          <div className="custom-select-wrapper">
            <button
              type="button"
              className={`custom-select ${
                openMenu === "university"
                  ? "open"
                  : ""
              }`}
              disabled={!specialization}
              onClick={() =>
                setOpenMenu(
                  openMenu === "university"
                    ? null
                    : "university"
                )
              }
            >
              <span
                className={
                  university
                    ? "selected-value"
                    : "placeholder-value"
                }
              >
                {specialization
                  ? getDisplayValue(
                      university,
                      "Select your university"
                    )
                  : "Select a specialization first"}
              </span>

              <span className="select-arrow">
                {openMenu === "university"
                  ? "▲"
                  : "▼"}
              </span>
            </button>

            {openMenu === "university" &&
              specialization && (
                <div className="custom-options">
                  {UNIVERSITIES.map(
                    (item) => (
                      <button
                        type="button"
                        key={item}
                        className={
                          university === item
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          handleUniversityChange(
                            item
                          )
                        }
                      >
                        <span>{item}</span>

                        {university === item && (
                          <span>✓</span>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
          </div>
        </div>
      </section>

      <section className="application-bottom">
        <div className="save-status">
          {saving && (
            <>
              <span className="save-spinner" />
              Saving your choices...
            </>
          )}

          {!saving && saved && (
            <>
              <span className="save-check">
                ✓
              </span>
              Saved automatically
            </>
          )}

          {!saving && !saved && (
            <>
              <span className="save-dot" />
              Changes save automatically
            </>
          )}
        </div>

        <button
          type="button"
          className="primary-button application-continue"
          disabled={!ready}
          onClick={() =>
            onContinue?.({
              field,
              specialization,
              university,
            })
          }
        >
          Continue to Documents
          <span>→</span>
        </button>
      </section>

      {!ready && (
        <p className="application-hint">
          Complete all three selections to
          continue.
        </p>
      )}
    </main>
  );
    }
