import {
  Card,
  CardContent,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import { licenseRatingOptions } from "./dropDownData";

const TransferList = ({ licenseRating, onRatingChange }) => {
  const [selectedAvailable, setSelectedAvailable] = useState([]);
  const [selectedCurrent, setSelectedCurrent] = useState([]);

  // Convert comma-separated string back to array for the multi-select
  const getSelectedRatings = (ratingString) => {
    if (!ratingString) return [];
    return ratingString.split(", ").filter((item) => item.trim() !== "");
  };

  const getAvailableRatings = () => {
    const currentRatings = getSelectedRatings(licenseRating);
    return licenseRatingOptions.filter(
      (option) => !currentRatings.includes(option.value)
    );
  };

  const getCurrentRatings = () => {
    const currentRatings = getSelectedRatings(licenseRating);
    return licenseRatingOptions.filter((option) =>
      currentRatings.includes(option.value)
    );
  };

  const handleToggleAvailable = (value) => {
    const currentIndex = selectedAvailable.indexOf(value);
    const newSelected = [...selectedAvailable];

    if (currentIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedAvailable(newSelected);
  };

  const handleToggleCurrent = (value) => {
    const currentIndex = selectedCurrent.indexOf(value);
    const newSelected = [...selectedCurrent];

    if (currentIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedCurrent(newSelected);
  };

  const handleAddRatings = () => {
    const newRatings = [
      ...getSelectedRatings(licenseRating),
      ...selectedAvailable,
    ];
    const ratingString = newRatings.join(", ");
    onRatingChange(ratingString);
    setSelectedAvailable([]);
  };

  const handleAddAllRatings = () => {
    const allRatings = licenseRatingOptions.map((option) => option.value);
    const ratingString = allRatings.join(", ");
    onRatingChange(ratingString);
    setSelectedAvailable([]);
  };

  const handleRemoveRatings = () => {
    const currentRatings = getSelectedRatings(licenseRating);
    const newRatings = currentRatings.filter(
      (rating) => !selectedCurrent.includes(rating)
    );
    const ratingString = newRatings.join(", ");
    onRatingChange(ratingString);
    setSelectedCurrent([]);
  };

  const handleRemoveAllRatings = () => {
    onRatingChange("");
    setSelectedCurrent([]);
  };

  const availableRatings = getAvailableRatings();
  const currentRatings = getCurrentRatings();

  return (
    <div className="mb-4">
      <Typography
        variant="subtitle2"
        className="!font-medium !text-gray-700 !mb-2"
      >
        License Ratings
      </Typography>

      <div className="flex flex-col md:flex-row items-stretch gap-4">
        {/* Available Ratings */}
        <Card variant="outlined" className="flex-1">
          <CardContent className="p-4">
            <Typography
              variant="subtitle2"
              className="!font-medium !text-gray-700 !mb-2"
            >
              Available Ratings
            </Typography>
            <Divider className="!my-2" />
            <List dense className="max-h-40 overflow-auto">
              {availableRatings.map((rating) => {
                const isSelected =
                  selectedAvailable.indexOf(rating.value) !== -1;
                return (
                  <ListItem key={rating.value} disablePadding>
                    <ListItemButton
                      onClick={() => handleToggleAvailable(rating.value)}
                      className="!py-1"
                      sx={{
                        backgroundColor: isSelected
                          ? "rgba(25, 118, 210, 0.08)"
                          : "inherit",
                        "&:hover": {
                          backgroundColor: isSelected
                            ? "rgba(25, 118, 210, 0.12)"
                            : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText primary={rating.label} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
              {availableRatings.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No ratings available"
                    className="!text-gray-400"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>

        {/* Transfer Buttons */}
        <div className="flex md:flex-col justify-center items-center gap-2 py-4">
          <IconButton
            size="small"
            onClick={handleAddRatings}
            disabled={selectedAvailable.length === 0}
            className="!bg-blue-100 hover:!bg-blue-200 !text-blue-600"
          >
            <ChevronRight size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleAddAllRatings}
            disabled={availableRatings.length === 0}
            className="!bg-blue-100 hover:!bg-blue-200 !text-blue-600"
          >
            <ChevronsRight size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleRemoveRatings}
            disabled={selectedCurrent.length === 0}
            className="!bg-blue-100 hover:!bg-blue-200 !text-blue-600"
          >
            <ChevronLeft size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleRemoveAllRatings}
            disabled={currentRatings.length === 0}
            className="!bg-blue-100 hover:!bg-blue-200 !text-blue-600"
          >
            <ChevronsLeft size={16} />
          </IconButton>
        </div>

        {/* Selected Ratings */}
        <Card variant="outlined" className="flex-1">
          <CardContent className="p-4">
            <Typography
              variant="subtitle2"
              className="!font-medium !text-gray-700 !mb-2"
            >
              Selected Ratings
            </Typography>
            <Divider className="!my-2" />
            <List dense className="max-h-40 overflow-auto">
              {currentRatings.map((rating) => {
                const isSelected = selectedCurrent.indexOf(rating.value) !== -1;
                return (
                  <ListItem key={rating.value} disablePadding>
                    <ListItemButton
                      onClick={() => handleToggleCurrent(rating.value)}
                      className="!py-1"
                      sx={{
                        backgroundColor: isSelected
                          ? "rgba(25, 118, 210, 0.08)"
                          : "inherit",
                        "&:hover": {
                          backgroundColor: isSelected
                            ? "rgva(25, 118, 210, 0.12)"
                            : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText primary={rating.label} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
              {currentRatings.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No ratings selected"
                    className="!text-gray-400"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransferList;
