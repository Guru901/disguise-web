"use client";
import type React from "react";
import { useState, useRef } from "react";

type User = {
  id: string;
  username: string;
  avatar: string | null;
  posts: string[] | null;
  friends: string[] | null;
  createdAt: Date;
  lastOnline: Date | null;
};

export function useMentionInput(users: User[] = []) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart ?? 0;
    setInputValue(value);

    // Find the last @ before cursor position
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      // Check if there's a space between @ and cursor (which would end the mention)
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const hasSpace = textAfterAt.includes(" ");

      if (!hasSpace) {
        const searchTerm = textAfterAt.toLowerCase();

        // If users array is empty or undefined, don't show dropdown
        if (!users || users.length === 0) {
          setShowDropdown(false);
          setFilteredUsers([]);
          return;
        }

        // Show all users immediately when @ is typed, then filter based on search term
        const filtered =
          searchTerm.length === 0
            ? users
            : users.filter((user) =>
                user.username.toLowerCase().includes(searchTerm),
              );

        setFilteredUsers(filtered);
        setMentionStart(lastAtIndex);
        setShowDropdown(filtered.length > 0);
        setSelectedIndex(0);
      } else {
        setShowDropdown(false);
        setFilteredUsers([]);
      }
    } else {
      setShowDropdown(false);
      setFilteredUsers([]);
    }
  };

  // Handle user selection
  const selectUser = (user: User) => {
    const username = user.username.replace(" ", "_");
    if (mentionStart === -1) return;

    const beforeMention = inputValue.substring(0, mentionStart);
    const afterCursor = inputValue.substring(
      inputRef.current?.selectionStart ?? inputValue.length,
    );

    const newValue = `${beforeMention}@${username} ${afterCursor}`;
    setInputValue(newValue);
    setShowDropdown(false);
    setFilteredUsers([]);
    setMentionStart(-1);

    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPosition = beforeMention.length + username.length + 2;
      inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, onSubmit?: () => void) => {
    if (showDropdown && filteredUsers.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredUsers[selectedIndex]) {
            selectUser(filteredUsers[selectedIndex]);
          }
          break;
        case "Escape":
          setShowDropdown(false);
          setFilteredUsers([]);
          break;
      }
    } else {
      // Handle normal input behavior when dropdown is not shown
      if (e.key === "Enter" && !e.shiftKey && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
    }
  };

  return {
    inputValue,
    setInputValue,
    showDropdown,
    setShowDropdown,
    filteredUsers,
    selectedIndex,
    inputRef,
    handleInputChange,
    selectUser,
    handleKeyDown,
  };
}
