import { useState } from 'react'
import { useAssetData } from './hooks/useAssetData'
import BalanceTab from './tabs/BalanceTab'
import TransactionsTab from './tabs/TransactionsTab'
import MarketTab from './tabs/MarketTab'
import AssetsTab from './tabs/AssetsTab'
import InvestmentsTab from './tabs/InvestmentsTab'
import AddAssetModal from './ui/AddAssetModal'

export default function FinanceView() {
	const [activeTab, setActiveTab] = useState('balance')
	const [showAddModal, setShowAddModal] = useState(false)
	const [selectedAsset, setSelectedAsset] = useState(null)

	//  Центральный хук данных (чтобы портфель обновлялся везде)
	const { assets, addAsset, prices, loading, lastUpdate, removeAsset } =
		useAssetData()

	// 🔹 Открытие модалки
	const handleOpenAddModal = asset => {
		setSelectedAsset(asset)
		setShowAddModal(true)
	}

	// 🔹 Сохранение в портфель
	const handleAddToPortfolio = data => {
		addAsset(data.code, data.amount, data.buyPrice)
		setShowAddModal(false)
	}

	const tabs = [
		{ id: 'balance', name: '💰 Баланс' },
		{ id: 'transactions', name: '📈 Транзакции' },
		{ id: 'market', name: '📊 Рынок' },
		{ id: 'assets', name: '💼 Портфель' },
		{ id: 'investments', name: '🏦 Инвестиции' },
	]

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
				{activeTab === 'transactions' && <TransactionsTab />}
				{activeTab === 'market' && (
					<MarketTab onAddToPortfolio={handleOpenAddModal} />
				)}
				{activeTab === 'assets' && (
					<AssetsTab
						assets={assets}
						prices={prices}
						loading={loading}
						lastUpdate={lastUpdate}
						addAsset={addAsset}
						removeAsset={removeAsset}
					/>
				)}
				{activeTab === 'investments' && <InvestmentsTab />}
			</div>

			{/* Модалка добавления */}
			{showAddModal && (
				<AddAssetModal
					asset={selectedAsset}
					onClose={() => setShowAddModal(false)}
					onAdd={handleAddToPortfolio}
				/>
			)}
		</div>
	)
}
