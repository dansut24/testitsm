import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Button,
  Paper,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const catalogueData = [
  {
    id: "1",
    name: "Laptop Request",
    category: "Hardware",
    price: "£1,200",
    image: "https://cdn-icons-png.flaticon.com/512/1063/1063191.png",
  },
  {
    id: "2",
    name: "New Software Installation",
    category: "Software",
    price: "£100",
    image: "https://cdn-icons-png.flaticon.com/512/906/906175.png",
  },
  {
    id: "3",
    name: "VPN Access",
    category: "Access",
    price: "£0",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135789.png",
  },
  {
    id: "4",
    name: "Onboarding Request",
    category: "HR",
    price: "£500",
    image: "https://cdn-icons-png.flaticon.com/512/3064/3064197.png",
  },
];

const ServiceCatalogue = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const headerHeight = 64; // Header fixed height in px

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // Only care about drops into the "selected" area
    if (result.destination.droppableId === "selected") {
      const item = catalogueData.find((i) => i.id === result.draggableId);
      if (item) {
        setSelectedItems((prev) => [
          ...prev,
          { ...item, instanceId: `${item.id}-${Date.now()}` },
        ]);

        // Push the selected request into the URL as a query param
        window.history.pushState(null, "", `?request=${item.id}`);
      }
    }
  };

  const handleRemoveItem = (instanceId) => {
    setSelectedItems((prev) =>
      prev.filter((i) => i.instanceId !== instanceId)
    );
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fixed Full Width Header */}
      <Box
        sx={{
          height: `${headerHeight}px`,
          width: "100%",
          bgcolor: "#1976d2",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          px: 3,
          flexShrink: 0,
        }}
      >
        <Typography variant="h6">Service Catalogue</Typography>
      </Box>

      {/* Drag & Drop Context wraps both sides */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Split content below header */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            height: `calc(100vh - ${headerHeight}px)`,
          }}
        >
          {/* Left - Catalogue */}
          <Droppable droppableId="catalogue" isDropDisabled>
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  flex: 1,
                  p: 3,
                  borderRight: isMobile ? "none" : "1px solid #ddd",
                  borderBottom: isMobile ? "1px solid #ddd" : "none",
                  overflowY: "auto",
                }}
              >
                <Typography variant="h5" mb={2}>
                  Catalogue
                </Typography>

                {catalogueData.map((item, index) => (
                  <Draggable
                    draggableId={item.id}
                    index={index}
                    key={item.id}
                  >
                    {(providedDraggable) => (
                      <Card
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        sx={{ mb: 2 }}
                      >
                        <CardActionArea sx={{ textAlign: "center", p: 2 }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ height: 80 }}
                          />
                          <CardContent>
                            <Typography variant="h6">{item.name}</Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Cost: {item.price}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </Box>
            )}
          </Droppable>

          {/* Right - Selected with independent scroll */}
          <Droppable droppableId="selected">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  flex: 1,
                  bgcolor: "#f9f9f9",
                  p: 3,
                  overflowY: "auto", // Only this side scrolls
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    minHeight: "100%",
                    border: "2px dashed #ccc",
                  }}
                >
                  <Typography variant="h5" mb={2}>
                    Selected Requests
                  </Typography>

                  {selectedItems.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Drag items here to add to your request.
                    </Typography>
                  )}

                  {selectedItems.map((item) => (
                    <Chip
                      key={item.instanceId}
                      label={`${item.name} (${item.price})`}
                      onDelete={() => handleRemoveItem(item.instanceId)}
                      sx={{ mb: 1, mr: 1 }}
                    />
                  ))}

                  {provided.placeholder}

                  {selectedItems.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6">
                        Estimated Total:{" "}
                        {selectedItems
                          .reduce((total, item) => {
                            const price =
                              parseFloat(item.price.replace("£", "")) || 0;
                            return total + price;
                          }, 0)
                          .toLocaleString("en-GB", {
                            style: "currency",
                            currency: "GBP",
                          })}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                      >
                        Proceed to Checkout
                      </Button>
                    </>
                  )}
                </Paper>
              </Box>
            )}
          </Droppable>
        </Box>
      </DragDropContext>
    </Box>
  );
};

export default ServiceCatalogue;
