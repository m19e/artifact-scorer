export interface Item<V> {
  key?: string
  label: string
  value: V
}

interface Props<V> {
  items: Item<V>[]
  onSelect: (v: V) => void
  defaultValue: V
  className: string
}

export const SelectInput = <V extends string>({
  items,
  onSelect,
  defaultValue,
  className,
}: Props<V>) => {
  return (
    <select
      key={defaultValue}
      className={className}
      defaultValue={defaultValue}
      onChange={(e) => onSelect(e.currentTarget.value as V)}
    >
      {items.map((item) => (
        <option key={item.key ?? item.label} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  )
}
