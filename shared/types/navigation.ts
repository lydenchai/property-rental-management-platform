import type { Component } from 'vue';

export interface NavItem {
  name: string;
  to: string;
  icon?: Component;
  exact?: boolean;
  show?: boolean;
}

export interface NavSection {
  title: string;
  show?: boolean;
  items: NavItem[];
}
