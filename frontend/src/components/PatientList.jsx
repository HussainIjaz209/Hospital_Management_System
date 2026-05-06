export default function PatientList({ patients, onChange }) {
  const handleDelete = async (id) => {
    await fetch(`/api/patients/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    onChange();
  };

  return (
    <div className="rounded-3xl border border-slate-200 p-5">
      <h3 className="mb-4 text-xl font-semibold text-slate-800">Patient List</h3>
      <div className="space-y-4">
        {patients.length === 0 ? (
          <p className="text-slate-600">No patients registered yet.</p>
        ) : (
          patients.map((patient) => (
            <div key={patient._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{patient.name}</p>
                  <p className="text-sm text-slate-600">{patient.gender} • Age {patient.age}</p>
                </div>
                <button
                  onClick={() => handleDelete(patient._id)}
                  className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
              {patient.notes && <p className="mt-3 text-slate-600">{patient.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
