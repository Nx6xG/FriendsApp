import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, ArrowRight, Check, ToggleLeft, ToggleRight, Link2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { uid, currency, cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { LinkedChips } from '@/components/ui/LinkedChips'
import { notifyExpenseAdded } from '@/lib/notifications'
import { LinkPicker } from '@/components/ui/LinkPicker'
import { hapticLight } from '@/lib/haptics'
import { ProPrompt } from '@/components/ui/ProGate'
import { canUseFeature } from '@/lib/plans'
import type { Group, ExpenseCategory } from '@/types'

const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string; emoji: string }[] = [
  { key: 'food', label: 'Essen', emoji: '🍽️' },
  { key: 'transport', label: 'Transport', emoji: '🚗' },
  { key: 'entertainment', label: 'Freizeit', emoji: '🎮' },
  { key: 'shopping', label: 'Einkauf', emoji: '🛒' },
  { key: 'housing', label: 'Wohnen', emoji: '🏠' },
  { key: 'travel', label: 'Reisen', emoji: '✈️' },
  { key: 'other', label: 'Sonstiges', emoji: '📌' },
]

function calcDebts(group: Group) {
  const balances: Record<string, number> = {}
  group.members.forEach((m) => (balances[m] = 0))

  group.expenses.forEach((e) => {
    if (e.customAmounts) {
      // Custom split: each person owes their specific amount
      balances[e.paidById] = (balances[e.paidById] || 0) + e.amount
      e.splitBetween.forEach((m) => {
        const owed = e.customAmounts![m] || 0
        balances[m] = (balances[m] || 0) - owed
        if (m === e.paidById) {
          // paidBy already got +amount, now subtract their own share
        }
      })
      // Correct: paidBy paid the full amount but also owes their share
      const paidByShare = e.customAmounts[e.paidById] || 0
      balances[e.paidById] -= paidByShare
    } else {
      // Equal split
      const share = e.amount / e.splitBetween.length
      balances[e.paidById] = (balances[e.paidById] || 0) + e.amount - share
      e.splitBetween.forEach((m) => {
        if (m !== e.paidById) {
          balances[m] = (balances[m] || 0) - share
        }
      })
    }
  })

  // Subtract payments (settlements)
  ;(group.payments || []).forEach((p) => {
    balances[p.from] = (balances[p.from] || 0) + p.amount
    balances[p.to] = (balances[p.to] || 0) - p.amount
  })

  // Simplify debts
  const debtors = Object.entries(balances)
    .filter(([, v]) => v < -0.01)
    .map(([k, v]) => ({ name: k, amount: -v }))
    .sort((a, b) => b.amount - a.amount)

  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 0.01)
    .map(([k, v]) => ({ name: k, amount: v }))
    .sort((a, b) => b.amount - a.amount)

  const transfers: { from: string; to: string; amount: number }[] = []
  let di = 0
  let ci = 0

  while (di < debtors.length && ci < creditors.length) {
    const transfer = Math.min(debtors[di].amount, creditors[ci].amount)
    if (transfer > 0.01) {
      transfers.push({ from: debtors[di].name, to: creditors[ci].name, amount: transfer })
    }
    debtors[di].amount -= transfer
    creditors[ci].amount -= transfer
    if (debtors[di].amount < 0.01) di++
    if (creditors[ci].amount < 0.01) ci++
  }

  return { transfers }
}

export function ExpensesPage() {
  const { group } = useOutletContext<{ group: Group }>()
  const { currentUser, addExpense, deleteExpense, updateExpense, addPayment, deletePayment, addFeedItem } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(currentUser)
  const [splitWith, setSplitWith] = useState<string[]>(group.members)
  const [useCustomSplit, setUseCustomSplit] = useState(false)
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
  const [linkingExpenseId, setLinkingExpenseId] = useState<string | null>(null)
  const [showProPrompt, setShowProPrompt] = useState<string | null>(null)
  const [category, setCategory] = useState<ExpenseCategory>('other')
  const [recurring, setRecurring] = useState<'none' | 'weekly' | 'monthly'>('none')

  const { transfers } = calcDebts(group)
  const totalSpent = group.expenses.reduce((s, e) => s + e.amount, 0)
  const payments = group.payments || []

  const handleAdd = () => {
    if (!title.trim() || !amount || splitWith.length === 0) return
    const totalAmount = parseFloat(amount)

    let custom: Record<string, number> | undefined
    if (useCustomSplit) {
      custom = {}
      splitWith.forEach((m) => {
        custom![m] = parseFloat(customAmounts[m] || '0') || 0
      })
      // Check if custom amounts add up
      const sum = Object.values(custom).reduce((s, v) => s + v, 0)
      if (Math.abs(sum - totalAmount) > 0.01) return // amounts don't match
    }

    const expense = {
      id: uid(),
      title: title.trim(),
      amount: totalAmount,
      paidById: paidBy,
      splitBetween: splitWith,
      ...(custom && { customAmounts: custom }),
      category,
      ...(recurring !== 'none' && { recurring }),
      date: new Date().toISOString().slice(0, 10),
      createdAt: Date.now(),
    }
    addExpense(group.id, expense)
    hapticLight()
    notifyExpenseAdded(expense, group.id)
    addFeedItem(group.id, {
      type: 'expense',
      text: `${currentUser} hat "${expense.title}" (${currency(expense.amount)}) hinzugefügt`,
      timestamp: Date.now(),
    })
    setTitle('')
    setAmount('')
    setPaidBy(currentUser)
    setSplitWith(group.members)
    setUseCustomSplit(false)
    setCustomAmounts({})
    setCategory('other'); setRecurring('none');
    setShowForm(false)
  }

  const handleMarkPaid = (from: string, to: string, amt: number) => {
    addPayment(group.id, {
      id: uid(),
      from, to,
      amount: amt,
      date: new Date().toISOString().slice(0, 10),
      // eslint-disable-next-line react-hooks/purity
      createdAt: Date.now(),
    })
    addFeedItem(group.id, {
      type: 'expense',
      text: `${from} hat ${currency(amt)} an ${to} bezahlt ✓`,
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now(),
    })
  }

  const toggleSplit = (member: string) => {
    setSplitWith((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    )
  }

  const equalShare = splitWith.length > 0 && amount ? parseFloat(amount) / splitWith.length : 0

  return (
    <div className="p-4">
      {/* Summary card */}
      <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-4 mb-5">
        <p className="text-[11px] text-indigo-300/70 uppercase tracking-widest font-semibold">
          Gesamtausgaben
        </p>
        <p className="text-3xl font-extrabold tracking-tight mt-1">{currency(totalSpent)}</p>
        <p className="text-xs text-zinc-500 mt-1">
          {group.expenses.length} Ausgaben · {group.members.length} Personen
        </p>
      </div>

      {/* Debt overview */}
      {transfers.length > 0 && (
        <div className="mb-5">
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">
            Offene Schulden
          </h4>
          <div className="flex flex-col gap-2">
            {transfers.map((t, i) => (
              <motion.div
                key={`${t.from}-${t.to}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 p-3 bg-[#161822] border border-white/[0.06] rounded-xl"
              >
                <Avatar name={t.from} size={26} />
                <span className="text-xs font-medium text-zinc-400 flex-1 truncate">
                  {t.from}
                </span>
                <ArrowRight size={12} className="text-zinc-600 shrink-0" />
                <span className="text-xs font-medium text-zinc-400 flex-1 truncate text-right">
                  {t.to}
                </span>
                <Avatar name={t.to} size={26} />
                <span className="text-sm font-bold text-amber-400 tabular-nums ml-1">
                  {currency(t.amount)}
                </span>
                <button onClick={() => handleMarkPaid(t.from, t.to, t.amount)}
                  className="ml-1 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 active:scale-95 transition-transform shrink-0"
                  title="Als bezahlt markieren">
                  <Check size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {transfers.length === 0 && group.expenses.length > 0 && (
        <div className="mb-5 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
          <p className="text-[13px] text-emerald-400 font-medium">Alles ausgeglichen ✓</p>
        </div>
      )}

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="mb-5">
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">
            Zahlungen
          </h4>
          <div className="flex flex-col gap-1.5">
            {[...payments].reverse().map((p) => (
              <div key={p.id}
                className="flex items-center gap-2 px-3 py-2.5 bg-[#161822] border border-white/[0.06] rounded-xl opacity-60">
                <Check size={12} className="text-emerald-400 shrink-0" />
                <span className="text-[12px] text-zinc-400 flex-1">
                  {p.from} → {p.to}
                </span>
                <span className="text-[12px] font-semibold text-emerald-400 tabular-nums">
                  {currency(p.amount)}
                </span>
                <span className="text-[10px] text-zinc-600">{p.date}</span>
                <button onClick={() => deletePayment(group.id, p.id)}
                  className="text-zinc-700 active:text-red-400 p-2">
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense list */}
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
          Ausgaben
        </h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-indigo-400 text-xs font-semibold flex items-center gap-1 active:opacity-70"
        >
          <Plus size={14} /> Neu
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-[#161822] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Wofür?"
                autoFocus
                className="w-full px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600"
              />
              <div className="flex gap-2">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Betrag (€)"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  className="flex-1 px-3 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 placeholder:text-zinc-600"
                />
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-28 px-2 py-2.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-zinc-400 text-xs outline-none"
                >
                  {group.members.map((m) => (
                    <option key={m} value={m}>
                      {m} zahlt
                    </option>
                  ))}
                </select>
              </div>

              {/* Split mode toggle */}
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-zinc-500">Aufteilen zwischen:</p>
                <button onClick={() => {
                    if (!canUseFeature('customSplit')) { setShowProPrompt('Individueller Split'); return }
                    setUseCustomSplit(!useCustomSplit)
                  }}
                  className={cn('flex items-center gap-1 text-[12px] font-medium px-3 py-2.5 rounded-lg transition-colors',
                    useCustomSplit ? 'text-indigo-300 bg-indigo-500/10' : 'text-zinc-600'
                  )}>
                  {useCustomSplit ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {useCustomSplit ? 'Individuell' : 'Gleichmäßig'}
                  {!canUseFeature('customSplit') && <span className="text-[9px] text-indigo-400 ml-1">⚡Pro</span>}
                </button>
              </div>

              {/* Member selection */}
              <div className="flex flex-wrap gap-2">
                {group.members.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleSplit(m)}
                    className={cn('px-3 py-2.5 rounded-lg text-xs font-medium transition-colors',
                      splitWith.includes(m)
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-[#0e1015] text-zinc-500 border border-white/[0.06]'
                    )}
                  >
                    {m}
                    {!useCustomSplit && splitWith.includes(m) && amount && (
                      <span className="ml-1 text-zinc-500">({currency(equalShare)})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom amounts */}
              {useCustomSplit && splitWith.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1">
                  {splitWith.map((m) => (
                    <div key={m} className="flex items-center gap-2">
                      <Avatar name={m} size={22} />
                      <span className="text-[12px] text-zinc-400 flex-1">{m}</span>
                      <input
                        value={customAmounts[m] || ''}
                        onChange={(e) => setCustomAmounts({ ...customAmounts, [m]: e.target.value })}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        className="w-24 px-2 py-1.5 bg-[#0e1015] border border-white/[0.08] rounded-lg text-white text-sm text-right outline-none placeholder:text-zinc-700"
                      />
                      <span className="text-[11px] text-zinc-600">€</span>
                    </div>
                  ))}
                  {amount && (() => {
                    const sum = splitWith.reduce((s, m) => s + (parseFloat(customAmounts[m] || '0') || 0), 0)
                    const diff = parseFloat(amount) - sum
                    return (
                      <p className={cn('text-[11px] text-right tabular-nums',
                        Math.abs(diff) < 0.01 ? 'text-emerald-400' : 'text-amber-400'
                      )}>
                        {Math.abs(diff) < 0.01 ? 'Passt ✓' : `Differenz: ${currency(diff)}`}
                      </p>
                    )
                  })()}
                </div>
              )}

              <div>
                <p className="text-[11px] text-zinc-500 mb-2">Kategorie:</p>
                <div className="flex flex-wrap gap-1.5">
                  {EXPENSE_CATEGORIES.map((c) => (
                    <button key={c.key} onClick={() => setCategory(c.key)}
                      className={cn('px-2.5 py-2 rounded-lg text-[11px] font-medium transition-colors',
                        category === c.key ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-[#0e1015] text-zinc-500 border border-white/[0.06]'
                      )}>
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-zinc-500">Wiederkehrend:</p>
                <div className="flex gap-1.5">
                  {(['none', 'weekly', 'monthly'] as const).map((r) => (
                    <button key={r} onClick={() => {
                        if (r !== 'none' && !canUseFeature('recurringExpenses')) { setShowProPrompt('Wiederkehrende Ausgaben'); return }
                        setRecurring(r)
                      }}
                      className={cn('px-2.5 py-2 rounded-lg text-[11px] font-medium transition-colors',
                        recurring === r ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-[#0e1015] text-zinc-500 border border-white/[0.06]'
                      )}>
                      {r === 'none' ? 'Einmalig' : r === 'weekly' ? 'Wöchentlich' : 'Monatlich'}
                      {r !== 'none' && !canUseFeature('recurringExpenses') && <span className="text-[9px] text-indigo-400 ml-1">⚡Pro</span>}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!title.trim() || !amount || splitWith.length === 0 || (useCustomSplit && Math.abs(splitWith.reduce((s, m) => s + (parseFloat(customAmounts[m] || '0') || 0), 0) - parseFloat(amount || '0')) > 0.01)}
                className="w-full py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-30"
              >
                Hinzufügen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-2">
        {group.expenses.length === 0 && (
          <p className="text-zinc-600 text-sm py-6 text-center">Noch keine Ausgaben</p>
        )}
        {[...group.expenses].reverse().map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 p-3.5 bg-[#161822] border border-white/[0.06] rounded-2xl"
          >
            <Avatar name={e.paidById} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">
                {e.category && EXPENSE_CATEGORIES.find(c => c.key === e.category)?.emoji} {e.title}
                {e.recurring && e.recurring !== 'none' && <span className="text-[10px] text-indigo-400/50 ml-1">🔄</span>}
              </p>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                {e.paidById} · {e.date} · {e.splitBetween.length} Pers.
                {e.customAmounts && <span className="text-indigo-400/50 ml-1">· individuell</span>}
              </p>
              {e.linkedItems && e.linkedItems.length > 0 && (
                <div className="mt-1">
                  <LinkedChips linkedItems={e.linkedItems} group={group} />
                </div>
              )}
            </div>
            <span className="text-sm font-bold tabular-nums">{currency(e.amount)}</span>
            <button onClick={() => setLinkingExpenseId(e.id)}
              className="text-zinc-700 active:text-indigo-400 p-2 transition-colors">
              <Link2 size={14} />
            </button>
            <button
              onClick={() => deleteExpense(group.id, e.id)}
              className="text-zinc-600 active:text-red-400 p-2 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {linkingExpenseId && (
        <LinkPicker
          group={group}
          availableTypes={['event', 'todo', 'place']}
          selected={group.expenses.find((e) => e.id === linkingExpenseId)?.linkedItems || []}
          onConfirm={(items) => { updateExpense(group.id, linkingExpenseId, { linkedItems: items }); setLinkingExpenseId(null) }}
          onClose={() => setLinkingExpenseId(null)}
        />
      )}

      {showProPrompt && (
        <ProPrompt feature={showProPrompt} onClose={() => setShowProPrompt(null)} />
      )}
    </div>
  )
}
