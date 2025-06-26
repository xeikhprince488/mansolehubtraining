import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import PaymentRequestsManager from "@/components/instructor/PaymentRequestsManager";
import PaymentSearchBar from "@/components/instructor/PaymentSearchBar";
import { CreditCard, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { db } from "@/lib/db";

const PaymentsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  // Get payment statistics
  const paymentStats = await db.manualPaymentRequest.aggregate({
    where: {
      course: {
        instructorId: userId
      }
    },
    _count: {
      id: true
    }
  });

  const pendingPayments = await db.manualPaymentRequest.count({
    where: {
      course: {
        instructorId: userId
      },
      status: "pending"
    }
  });

  const approvedPayments = await db.manualPaymentRequest.count({
    where: {
      course: {
        instructorId: userId
      },
      status: "approved"
    }
  });

  const rejectedPayments = await db.manualPaymentRequest.count({
    where: {
      course: {
        instructorId: userId
      },
      status: "rejected"
    }
  });

  // Get instructor's courses for filter dropdown
  const courses = await db.course.findMany({
    where: {
      instructorId: userId
    },
    select: {
      id: true,
      title: true
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Payment Management
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Review and approve student payment requests for course access
              </p>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mx-auto mb-4">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{paymentStats._count.id}</div>
                  <div className="text-blue-100 text-sm">Total Requests</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-lg mx-auto mb-4">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{pendingPayments}</div>
                  <div className="text-blue-100 text-sm">Pending</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{approvedPayments}</div>
                  <div className="text-blue-100 text-sm">Approved</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-lg mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{rejectedPayments}</div>
                  <div className="text-blue-100 text-sm">Rejected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <PaymentRequestsManager courses={courses} />
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;