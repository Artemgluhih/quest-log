import { useState } from 'react'
import { useFinanceData } from './hooks/useFinanceData'
import { useAssetData } from './hooks/useAssetData' // ← Добавь этот импорт
import BalanceTab from './tabs/BalanceTab'
import TransactionsTab from './tabs/TransactionsTab'
import MarketTab from './tabs/MarketTab'
import AssetsTab from './tabs/AssetsTab'
import InvestmentsTab from './tabs/InvestmentsTab'
import AddTransactionModal from './ui/AddTransactionModal'
import AddAssetModal from './ui/AddAssetModal'

export default function FinanceView() {
	const [activeTab, setActiveTab] = useState('balance')
	const [showModal, setShowModal] = useState(false)
	const [showAddAssetModal, setShowAddAssetModal] = useState(false)
	const [selectedAsset, setSelectedAsset] = useState(null)

	// 🔹 Хук для транзакций
	const {
		transactions,
		totals,
		categories,
		loading,
		addTransaction,
		deleteTransaction, // ← Теперь берём отсюда!
	} = useFinanceData()

	// 🔹 Хук для активов
	const {
		assets,
		prices,
		loading: assetsLoading,
		lastUpdate,
		addAsset,
		removeAsset,
	} = useAssetData()

	const tabs = [
		{ id: 'balance', name: '💰 Баланс' },
		{ id: 'transactions', name: '📈 Транзакции' },
		{ id: 'market', name: '📊 Рынок' },
		{ id: 'assets', name: '💼 Портфель' },
		{ id: 'investments', name: '🏦 Инвестиции' },
	]

	// 🔹 Открытие модалки для актива
	const handleOpenAddAssetModal = asset => {
		setSelectedAsset(asset)
		setShowAddAssetModal(true)
	}

	// 🔹 Сохранение актива
	const handleAddToPortfolio = data => {
		addAsset(data.code, data.amount, data.buyPrice)
		setShowAddAssetModal(false)
	}

	return (
		<div className='flex flex-col h-full w-full bg-gray-900 text-white'>
			{/* Табы */}
			<div className='flex items-center gap-2 p-4 bg-gray-800 border-b border-gray-700 overflow-x-auto w-full'>
				{tabs.map(tab => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
							activeTab === tab.id
								? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
								: 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
						}`}
					>
						{tab.name}
					</button>
				))}
			</div>

			{/* Контент */}
			<div className='flex-1 overflow-y-auto p-6 w-full custom-scrollbar relative'>
				{activeTab === 'balance' && <BalanceTab />}
				{activeTab === 'transactions' && (
					<TransactionsTab
						onAdd={() => setShowModal(true)}
						onDelete={deleteTransaction} // ← Теперь это определено!
					/>
				)}
				{activeTab === 'market' && (
					<MarketTab onAddToPortfolio={handleOpenAddAssetModal} />
				)}
				{activeTab === 'assets' && (
					<AssetsTab
						assets={assets}
						prices={prices}
						loading={assetsLoading}
						lastUpdate={lastUpdate}
						addAsset={addAsset}
						removeAsset={removeAsset}
					/>
				)}
				{activeTab === 'investments' && <InvestmentsTab />}
			</div>

			{/* Модалка для транзакций */}
			{showModal && (
				<AddTransactionModal
					onClose={() => setShowModal(false)}
					onSave={tx => {
						addTransaction(tx)
						setShowModal(false)
					}}
				/>
			)}

			{/* Модалка для активов */}
			{showAddAssetModal && (
				<AddAssetModal
					asset={selectedAsset}
					onClose={() => setShowAddAssetModal(false)}
					onAdd={handleAddToPortfolio}
				/>
			)}
		</div>
	)
}
