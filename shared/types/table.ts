export type ColumnAlign = 'left' | 'center' | 'right';

export interface TableColumn<T = any> {
  key: string;
  label?: string;
  align?: ColumnAlign;
  sortable?: boolean;
  width?: string;
  class?: string;
  headerClass?: string;
  cellClass?: string;
}
