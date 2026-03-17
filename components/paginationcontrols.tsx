import { ArrowLeft, ArrowRight } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/constants";

type Props = {
  page: number;
  totalPages: number;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function PaginationControls({
  page,
  totalPages,
  loading,
  onPrevious,
  onNext,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevious}
          disabled={page === 1 || loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all"
        >
          <ArrowLeft size={14} />
          Previous
        </button>

        <div className="flex items-center gap-1.5 px-4 py-2.5">
          <span className="text-slate-800 font-semibold text-sm">{page}</span>
          <span className="text-slate-300 text-sm">/</span>
          <span className="text-slate-400 text-sm">{totalPages}</span>
        </div>

        <button
          onClick={onNext}
          disabled={page === totalPages || loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all"
        >
          Next
          <ArrowRight size={14} />
        </button>
      </div>

      <p className="text-gray-400 text-sm">
        Questions? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
          {CONTACT_EMAIL}
        </a>
      </p>
    </div>
  );
}
