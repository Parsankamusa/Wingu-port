import {
  ExternalLink,
  FileText
} from "lucide-react";
import SectionCard from "./SectionCard";
import Button from "../../../../../components/common/Button";

const DocumentsSection = ({
  formData,
  isEditing,
  onFileSelect,
  cvFile,
  licenseFile,
}) => {
  return (
    <SectionCard title="Your Documents">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center">
          <FileText className="w-10 h-10 text-secondary-400 mb-2" />
          <p className="font-semibold mb-2">Resume/CV</p>
          {formData.documents?.cv && !cvFile && (
            <a
              href={formData.documents.cv}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary-600 hover:underline flex items-center justify-center mb-2"
            >
              View Current CV <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          )}
          {cvFile && (
            <p className="text-sm text-secondary-700 mb-2">{cvFile.name}</p>
          )}
          {isEditing && (
            <>
              <input
                id="cv-upload"
                type="file"
                className="hidden"
                onChange={(e) => onFileSelect(e, "cv")}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => document.getElementById("cv-upload").click()}
              >
                {formData.documents?.cv || cvFile
                  ? "Replace File"
                  : "Upload File"}
              </Button>
            </>
          )}
        </div>
        <div className="border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center">
          <FileText className="w-10 h-10 text-secondary-400 mb-2" />
          <p className="font-semibold mb-2">Licenses & Certificates</p>
          {formData.documents?.aviation_licenses && !licenseFile && (
            <a
              href={formData.documents.aviation_licenses}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary-600 hover:underline flex items-center justify-center mb-2"
            >
              View Current Licenses <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          )}
          {licenseFile && (
            <p className="text-sm text-secondary-700 mb-2">
              {licenseFile.name}
            </p>
          )}
          {isEditing && (
            <>
              <input
                id="license-upload"
                type="file"
                className="hidden"
                onChange={(e) => onFileSelect(e, "license")}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  document.getElementById("license-upload").click()
                }
              >
                {formData.documents?.aviation_licenses || licenseFile
                  ? "Replace File"
                  : "Upload File"}
              </Button>
            </>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default DocumentsSection;
