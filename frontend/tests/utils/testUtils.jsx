import React from "react";
import { render } from "@testing-library/react-native";

const Providers = ({ children }) => <>{children}</>;

export const renderWithProviders = (ui, options = {}) =>
  render(ui, { wrapper: Providers, ...options });

export const flushMicrotasksQueue = () => new Promise((resolve) => setImmediate(resolve));
