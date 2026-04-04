const initialState = {
  student_id: '',
  roll_no: '',
  full_name: '',
  class_name: '',
  section_name: '',
  parent_name: '',
  phone: '',
  address: '',
  total_fee: ''
};

export default function StudentForm({ form, setForm, onSubmit, editing }) {
  const update = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form className="card grid-form" onSubmit={onSubmit}>
      <h3>{editing ? 'Update Student' : 'Add New Student'}</h3>
      {Object.keys(initialState).map((key) => (
        <div key={key} className="form-group">
          <label>{key.replaceAll('_', ' ').toUpperCase()}</label>
          {key === 'address' ? (
            <textarea name={key} value={form[key] || ''} onChange={update} rows="3" />
          ) : (
            <input
              type={key === 'total_fee' ? 'number' : 'text'}
              name={key}
              value={form[key] || ''}
              onChange={update}
              required={['student_id', 'roll_no', 'full_name', 'class_name', 'total_fee'].includes(key)}
            />
          )}
        </div>
      ))}
      <button className="btn primary" type="submit">
        {editing ? 'Update Student' : 'Add Student'}
      </button>
    </form>
  );
}
