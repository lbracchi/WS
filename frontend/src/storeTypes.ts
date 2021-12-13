import { UserData, ChatMessage } from "./types";

export interface NavigationState {
  isSidebarOpen: boolean;
  screenWidth: number;
  donationCreationFlag: boolean;
  familySubscribeFlag: boolean;
}

export interface UserState {
  token: string;
  userData: UserData;
}

export interface SocketIoState {
  
  unreadMessages: ChatMessage[],
  chat: ChatMessage[],
  donationId: string,
  connected: boolean,
}