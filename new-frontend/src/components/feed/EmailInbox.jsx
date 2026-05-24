import { Mail, CheckCircle2 } from 'lucide-react';

export default function EmailInbox({ emails }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-semibold text-lg">Priority Inbox</h3>
          <p className="text-xs text-gray-500 mt-1">Filtered from 42 total emails</p>
        </div>
        <button className="text-aura-purple p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <CheckCircle2 size={20} />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
        {emails.map((email) => (
          <div key={email.id} className="group cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <h4 className={`text-sm ${email.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}>
                {email.from}
              </h4>
              <span className={`text-[10px] font-medium ${email.unread ? 'text-aura-purple' : 'text-gray-400'}`}>
                {email.time}
              </span>
            </div>
            <p className={`text-xs mb-1 ${email.unread ? 'font-semibold text-gray-800' : 'font-medium text-gray-500'}`}>
              {email.subject}
            </p>
            <p className="text-xs text-gray-400 line-clamp-1">{email.snippet}</p>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 text-xs font-semibold text-gray-500 hover:text-aura-purple transition-colors pt-4 border-t border-gray-50">
        Open Gmail
      </button>
    </div>
  );
}