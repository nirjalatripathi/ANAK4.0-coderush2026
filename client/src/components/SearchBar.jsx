export default function SearchBar({ value, onChange, placeholder = 'Search', onSubmit, children }) {
  return (
    <form
      className="flex flex-col gap-3 md:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(event);
      }}
    >
      <label className="sr-only" htmlFor="search-q">{placeholder}</label>
      <input
        id="search-q"
        className="input-gov"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {children}
      <button type="submit" className="btn-primary">Search</button>
    </form>
  );
}
