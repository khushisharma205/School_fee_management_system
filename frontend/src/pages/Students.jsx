import { useEffect, useState } from 'react';
import api from '../api';
import StudentForm from '../components/StudentForm';
import StudentTable from '../components/StudentTable';

const blankForm = {
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

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadStudents = async () => {
    const { data } = await api.get('/students');
    setStudents(data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, form);
        setMessage('Student updated successfully');
      } else {
        await api.post('/students', form);
        setMessage('Student added successfully');
      }
      setForm(blankForm);
      setEditingId(null);
      loadStudents();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setForm({
      student_id: student.student_id,
      roll_no: student.roll_no,
      full_name: student.full_name,
      class_name: student.class_name,
      section_name: student.section_name || '',
      parent_name: student.parent_name || '',
      phone: student.phone || '',
      address: student.address || '',
      total_fee: student.total_fee
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this student?');
    if (!ok) return;
    await api.delete(`/students/${id}`);
    setMessage('Student deleted successfully');
    if (editingId === id) {
      setEditingId(null);
      setForm(blankForm);
    }
    loadStudents();
  };

  return (
    <div className="content-grid">
      {message && <div className="alert success">{message}</div>}
      <StudentForm form={form} setForm={setForm} onSubmit={handleSubmit} editing={Boolean(editingId)} />
      <StudentTable students={students} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
