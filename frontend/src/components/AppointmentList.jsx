export default function AppointmentList({ appointments, onChange }) {
  const handleDelete = async (id) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    onChange();
  };

  return (
    <div className="rounded-3xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">Scheduled Appointments</h3>
      </div>
      <div className="mt-4 space-y-4">
        {appointments.length === 0 ? (
          <p className="text-slate-600">No appointments scheduled yet.</p>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{appointment.patient?.name} with {appointment.doctor?.name}</p>
                  <p className="text-sm text-slate-600">{new Date(appointment.date).toLocaleString()}</p>
                  <p className="text-sm text-slate-600">Status: {appointment.status}</p>
                </div>
                <button
                  onClick={() => handleDelete(appointment._id)}
                  className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                >
                  Cancel
                </button>
              </div>
              {appointment.reason && <p className="mt-3 text-slate-600">Reason: {appointment.reason}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
