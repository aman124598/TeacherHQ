"use client"

import { useAuth } from "@/lib/firebase/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CreditCard, 
  Users, 
  Zap, 
  CheckCircle2, 
  ArrowUpCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  IndianRupee
} from "lucide-react"
import { getPlanDetails } from "@/lib/config/plans"
import Link from "next/link"

export default function BillingPage() {
  const { organization, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const currentPlan = organization?.plan || "starter"
  const planDetails = getPlanDetails(currentPlan)
  const memberCount = organization?.memberCount || 1
  const memberLimit = planDetails.maxMembers
  const memberPercentage = Math.round((memberCount / memberLimit) * 100)

  const isStarter = currentPlan === 'starter'
  const isGrowth = currentPlan === 'growth'

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-0 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground mt-1">Manage your organization's plan and billing information</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
          <ShieldCheck className="w-4 h-4 mr-2" />
          Active Account
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Plan Summary */}
        <Card className="md:col-span-2 border-l-4 border-l-purple-500 shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Zap className="w-5 h-5 mr-2 text-purple-500" />
              Current Plan: <span className="ml-2 uppercase text-purple-600 dark:text-purple-400">{currentPlan}</span>
            </CardTitle>
            <CardDescription>
              Your subscription is managed through DodoPayments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground flex items-center">
                    <Users className="w-4 h-4 mr-2" /> 
                    Staff Usage
                  </span>
                  <span className="text-sm font-bold">{memberCount} / {memberLimit === Infinity ? "Unlimited" : memberLimit}</span>
                </div>
                {memberLimit !== Infinity && (
                  <>
                    <Progress value={Math.min(memberPercentage, 100)} className={`h-2 ${memberPercentage > 90 ? "bg-red-100" : ""}`} />
                    <p className={`text-xs mt-2 ${memberPercentage > 90 ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>
                      {memberPercentage}% of limit used
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2 p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center mb-2">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  Pricing
                </span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {isStarter ? "₹499" : isGrowth ? "₹1,999" : "Custom"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Next billing cycle: Auto-renew</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Included Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {planDetails.features.map((feature, i) => (
                  <div key={i} className="flex items-center text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50/50 dark:bg-slate-800/30 border-t flex justify-between">
             <Button variant="outline" asChild>
                <Link href="/" target="_blank">
                  View Landing Page <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
             </Button>
             {isStarter && (
               <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white" asChild>
                  <Link href="https://checkout.dodopayments.com/buy/pdt_0Nbst8gsTLhHEJS9Q4LiT?quantity=1" target="_blank">
                    Upgrade to Growth <ArrowUpCircle className="w-4 h-4 ml-2" />
                  </Link>
               </Button>
             )}
          </CardFooter>
        </Card>

        {/* Payment Stats Card */}
        <div className="space-y-6">
          <Card className="shadow-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center p-3 border rounded-xl bg-white dark:bg-slate-900">
                <CreditCard className="w-10 h-10 p-2 bg-blue-100 text-blue-600 rounded-lg mr-4" />
                <div>
                  <p className="text-sm font-semibold">DodoPayments</p>
                  <p className="text-xs text-muted-foreground">Secure Billing Portal</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
               <Button variant="ghost" size="sm" className="w-full text-blue-600" asChild>
                 <Link href="https://dodopayments.com" target="_blank">
                    Manage at DodoPayments
                 </Link>
               </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-premium bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none">
            <CardHeader>
              <CardTitle className="text-white">Need Enterprise?</CardTitle>
              <CardDescription className="text-indigo-100">For multi-campus or large scale organizations.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90 mb-4">Get custom limits, white-labeling, and dedicated support for your institution.</p>
              <Button variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-indigo-50" asChild>
                <Link href="mailto:amanraj89969@gmail.com?subject=TeacherHQ Enterprise Inquiry">
                  Contact Sales
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
          <CardDescription>Recent transactions and invoices</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mb-4 opacity-10" />
              <p>Your invoice history will appear here once processed by DodoPayments.</p>
              <p className="text-xs">Invoices are sent directly to your admin email: {organization?.adminEmail || "Email not found"}</p>
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
