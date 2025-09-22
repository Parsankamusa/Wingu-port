export const validateStep = (
  stepIndex,
  formData,
  setErrors,
  setValidationError
) => {
  setValidationError("");

  switch (stepIndex) {
    case 0: // Personal Info
      const personalInfo = formData.personalInfo;
      if (!personalInfo.first_name?.trim()) {
        setValidationError("First name is required");
        setErrors((prev) => ({
          ...prev,
          first_name: "First name is required",
        }));
        return false;
      }
      if (!personalInfo.last_name?.trim()) {
        setValidationError("Last name is required");
        setErrors((prev) => ({ ...prev, last_name: "Last name is required" }));
        return false;
      }
      if (!personalInfo.phone_number?.trim()) {
        setValidationError("Phone number is required");
        setErrors((prev) => ({
          ...prev,
          phone_number: "Phone number is required",
        }));
        return false;
      }
      if (!personalInfo.date_of_birth) {
        setValidationError("Date of birth is required");
        setErrors((prev) => ({
          ...prev,
          date_of_birth: "Date of birth is required",
        }));
        return false;
      }

      if (!personalInfo.nationality?.trim()) {
        setValidationError("Nationality is required");
        setErrors((prev) => ({
          ...prev,
          nationality: "Nationality is required",
        }));
        return false;
      }

      if (!personalInfo.national_id?.trim()) {
        setValidationError("National ID is required");
        setErrors((prev) => ({
          ...prev,
          national_id: "National ID is required",
        }));
        return false;
      }

      if (!personalInfo.city?.trim()) {
        setValidationError("City is required");
        setErrors((prev) => ({ ...prev, city: "City is required" }));
        return false;
      }

      if (!personalInfo.country?.trim()) {
        setValidationError("Country is required");
        setErrors((prev) => ({ ...prev, country: "Country is required" }));
        return false;
      }

      if (!personalInfo.language?.trim()) {
        setValidationError("Language is required");
        setErrors((prev) => ({ ...prev, language: "Language is required" }));
        return false;
      }

      if (!personalInfo.availability?.trim()) {
        setValidationError("Availability is required");
        setErrors((prev) => ({
          ...prev,
          availability: "Availability is required",
        }));
        return false;
      }
      return true;

    case 1: // Experience
      const experience = formData.experience;
      if (!experience.current_job_title?.trim()) {
        setValidationError("Current job title is required");
        setErrors((prev) => ({
          ...prev,
          current_job_title: "Current job title is required",
        }));
        return false;
      }
      if (!experience.years_of_experience) {
        setValidationError("Years of experience is required");
        setErrors((prev) => ({
          ...prev,
          years_of_experience: "Years of experience is required",
        }));
        return false;
      }
      if (!experience.aviation_specialization?.trim()) {
        setValidationError("At least one aviation specialization is required");
        setErrors((prev) => ({
          ...prev,
          aviation_specialization:
            "At least one aviation specialization is required",
        }));
        return false;
      }
      return true;

    case 2: // Documents
      const documents = formData.documents;
      if (!documents.cv) {
        setValidationError("Resume/CV is required");
        return false;
      }
      return true;

    case 3: // Professional Role
      const professionalRoles = formData.professionalRoles;
      if (!professionalRoles || professionalRoles.length === 0) {
        setValidationError("At least one professional role is required");
        setErrors((prev) => ({
          ...prev,
          professionalRoles: "At least one professional role is required",
        }));
        return false;
      }
      let newErrors = {};
      professionalRoles.forEach((role, index) => {
        if (!role.aviation_category) {
          newErrors[`aviation_category_${index}`] =
            "Aviation category is required";
        }
        if (!role.title) {
          newErrors[`title_${index}`] = "Title is required";
        }
        if (!role.regulatory_body) {
          newErrors[`regulatory_body_${index}`] = "Regulatory body is required";
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }));
        setValidationError("Please fill all required professional role fields");
        return false;
      }
      return true;

    case 4: // Qualifications
      const qualifications = formData.qualifications;
      if (!qualifications || qualifications.length === 0) {
        setValidationError("At least one qualification is required");
        setErrors((prev) => ({
          ...prev,
          qualifications: "At least one qualification is required",
        }));
        return false;
      }

      let qualificationErrors = {};

      qualifications.forEach((qualification, index) => {
        if (!qualification.highest_education_level) {
          qualificationErrors[`highest_education_level_${index}`] =
            "Education level is required";
        }
        if (!qualification.course_of_study) {
          qualificationErrors[`course_of_study_${index}`] =
            "Course of study is required";
        }
        if (!qualification.institution) {
          qualificationErrors[`institution_${index}`] =
            "Institution is required";
        }
      });

      if (Object.keys(qualificationErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...qualificationErrors }));
        setValidationError("Please fill all required qualification fields");
        return false;
      }
      return true;

    case 5: // Licenses
      const licenses = formData.licenses;
      if (!licenses || licenses.length === 0) {
        setValidationError("At least one license is required");
        setErrors((prev) => ({
          ...prev,
          licenses: "At least one license is required",
        }));
        return false;
      }
      let licenseErrors = {};

      licenses.forEach((license, index) => {
        if (!license.license_type) {
          licenseErrors[`license_type_${index}`] = "License type is required";
        }
        if (!license.issue_authority) {
          licenseErrors[`issue_authority_${index}`] =
            "Issue authority is required";
        }
        if (!license.license_number) {
          licenseErrors[`license_number_${index}`] =
            "License number is required";
        }
        if (!license.license_status) {
          licenseErrors[`license_status_${index}`] =
            "License status is required";
        }
        if (!license.issue_date) {
          licenseErrors[`issue_date_${index}`] = "Issue date is required";
        }
        if (!license.expiry_date) {
          licenseErrors[`expiry_date_${index}`] = "Expiry date is required";
        }
      });
      if (Object.keys(licenseErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...licenseErrors }));
        setValidationError("Please fill all required license fields");
        return false;
      }
      return true;

    case 6: // Employment History
      const employmentHistory = formData.employmentHistory;
      if (!employmentHistory || employmentHistory.length === 0) {
        setValidationError("At least one employment entry is required");
        setErrors((prev) => ({
          ...prev,
          employmentHistory: "At least one employment entry is required",
        }));
        return false;
      }
      let employmentHistoryErrors = {};

      employmentHistory.forEach((employment, index) => {
        if (!employment.company_name) {
          employmentHistoryErrors[`company_name_${index}`] =
            "Company name is required";
        }
        if (!employment.job_title) {
          employmentHistoryErrors[`job_title_${index}`] =
            "Job title is required";
        }
        if (!employment.start_date) {
          employmentHistoryErrors[`start_date_${index}`] =
            "Start date is required";
        }
        if (!employment.is_current && !employment.end_date) {
          employmentHistoryErrors[`end_date_${index}`] =
            "End date is required unless this is your current job";
        }
        if (!employment.responsibilities) {
          employmentHistoryErrors[`responsibilities_${index}`] =
            "Responsibilities are required";
        }
      });
      if (Object.keys(employmentHistoryErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...employmentHistoryErrors }));
        setValidationError(
          "Please fill all required employment history fields"
        );
        return false;
      }
      return true;

    default:
      return true;
  }
};
