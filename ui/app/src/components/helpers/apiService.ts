const BASE_URL = "http://localhost/api";

interface EventDetails {
  organizer_id: string;
  name: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  description: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  role: string;
}

interface EventUpdateDetails {
  organizer_id: string;
  name: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  description: string;
}

interface BookingRequestParams {
  eventId: string;
  djId: string;
  status?: "pending" | "confirmed" | "cancelled";
}

interface UserProfile {
  username: string;
  email: string;
  password?: string;
  role: string;
  user_id: string;
}

interface Booking {
  booking_id: string;
  dj_id: string;
  status: string;
  djUsername?: string;
}

interface ResetPasswordParams {
  token: string;
  password: string;
}

export const loginUser = async (username: string, password: string) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error("Login failed");
  }
  return response.json();
};

export const fetchSession = async () => {
  try {
    const response = await fetch(`${BASE_URL}/auth/session`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch session data.");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
  return response.json();
};

export const fetchEventDetail = async (eventId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/events/${eventId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch event details.");
    }
    const data = await response.json();
    if (data.status !== "success" || data.data.length === 0) {
      throw new Error("No event details found.");
    }
    return data.data[0];
  } catch (error) {
    throw error;
  }
};

export const sendBookingRequest = async ({
  eventId,
  djId,
  status = "pending",
}: BookingRequestParams) => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ event_id: eventId, dj_id: djId, status }),
    });
    if (!response.ok) {
      throw new Error("Failed to send booking request.");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchEvents = async () => {
  try {
    const response = await fetch(`${BASE_URL}/events`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    throw error;
  }
};

export const fetchBookings = async (djId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${djId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    throw error;
  }
};

export const cancelBooking = async (bookingId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to cancel booking");
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchUserEvents = async (userId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/user-events/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch events.");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/events/${eventId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("Failed to delete event.");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createEvent = async (eventDetails: EventDetails) => {
  try {
    const response = await fetch(`${BASE_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventDetails),
    });
    if (!response.ok) {
      throw new Error("Failed to create event.");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchEventDetails = async (eventId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/events/${eventId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch event details.");
    }
    const data = await response.json();

    if (data.status !== "success" || !data.data) {
      throw new Error("No event details found.");
    }
    return data.data[0];
  } catch (error) {
    throw error;
  }
};

export const updateEvent = async (
  eventId: string,
  eventDetails: EventUpdateDetails
) => {
  try {
    const response = await fetch(`${BASE_URL}/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventDetails),
    });
    if (!response.ok) {
      throw new Error("Failed to update event.");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch(`${BASE_URL}/auth/session`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user profile.");
  }
  const data = await response.json();
  if (data.status !== "success") {
    throw new Error("Error fetching user profile.");
  }
  return data.data.user;
};

export const fetchUserById = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user.");
    }
    const data = await response.json();
    if (data.status !== "success") {
      throw new Error("Error fetching user data.");
    }
    return data.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUsers = async (): Promise<UserProfile[]> => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch users.");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to delete user.");
    }
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  profileData: UserProfile
): Promise<void> => {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    throw new Error("Failed to update profile.");
  }
};

export const fetchBookingsForEvent = async (
  eventId: string
): Promise<Booking[]> => {
  try {
    const response = await fetch(`${BASE_URL}/event-bookings/${eventId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  newStatus: "confirmed" | "cancelled"
): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok)
      throw new Error(`Failed to update booking status to ${newStatus}.`);
  } catch (error) {
    throw error;
  }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/auth/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to request password reset");
  }
};

export const registerUser = async (
  registerData: RegisterData
): Promise<void> => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(registerData),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to register");
  }
};

export const confirmResetPassword = async ({
  token,
  password,
}: ResetPasswordParams): Promise<void> => {
  const response = await fetch(`${BASE_URL}/auth/reset/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to set new password");
  }
};
