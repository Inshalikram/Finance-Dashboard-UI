let transactions = JSON.parse(localStorage.getItem('data')) || [
  {date:'2026-04-01',category:'Salary',amount:5000,type:'income'},
  {date:'2026-04-02',category:'Food',amount:200,type:'expense'},
  {date:'2026-04-03',category:'Shopping',amount:400,type:'expense'},
  {date:'2026-04-04',category:'Freelance',amount:800,type:'income'}
];

let lineChart, pieChart;
let editingIndex = null;

function render(){
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  const search = document.getElementById('search').value.toLowerCase();
  const filter = document.getElementById('filterType').value;

  const filtered = transactions.filter((t,i)=> 
    (filter==='all'||t.type===filter) &&
    t.category.toLowerCase().includes(search)
  );

  document.getElementById('emptyState').style.display = filtered.length===0?'block':'none';

  filtered.forEach((t,i)=>{
    const idx = transactions.indexOf(t);
    let actions = '';
    if(document.getElementById('role').value==='admin'){
      actions = `<button onclick="editTransaction(${idx})">✏️</button>
                 <button onclick="deleteTransaction(${idx})">🗑️</button>`;
    }
    tbody.innerHTML += `<tr>
      <td>${t.date}</td>
      <td>${t.category}</td>
      <td>$${t.amount}</td>
      <td><span class="badge ${t.type}">${t.type}</span></td>
      <td>${actions}</td>
    </tr>`;
  });

  const income = transactions.filter(t=>t.type==='income').reduce((a,b)=>a+b.amount,0);
  const expense = transactions.filter(t=>t.type==='expense').reduce((a,b)=>a+b.amount,0);

  document.getElementById('income').innerText='$'+income;
  document.getElementById('expense').innerText='$'+expense;
  document.getElementById('balance').innerText='$'+(income-expense);

  updateCharts();
  updateInsights();
}

function updateCharts(){
  if(lineChart) lineChart.destroy();
  if(pieChart) pieChart.destroy();

  lineChart = new Chart(document.getElementById('lineChart'),{
    type:'line',
    data:{
      labels:transactions.map(t=>t.date),
      datasets:[{label:'Trend',data:transactions.map(t=>t.amount),fill:true,backgroundColor:'rgba(102,126,234,0.2)',borderColor:'#667eea'}]
    },
    options:{maintainAspectRatio:false, animation:{duration:800}}
  });

  let categories={};
  transactions.forEach(t=>{if(t.type==='expense') categories[t.category]=(categories[t.category]||0)+t.amount;});
  pieChart = new Chart(document.getElementById('pieChart'),{
    type:'doughnut',
    data:{labels:Object.keys(categories), datasets:[{data:Object.values(categories),backgroundColor:['#e74c3c','#f39c12','#8e44ad','#3498db','#2ecc71']}]},
    options:{maintainAspectRatio:false, animation:{duration:800}}
  });
}

function updateInsights(){
  const expenses = transactions.filter(t=>t.type==='expense');
  if(expenses.length===0){document.getElementById('insights').innerText='No insights';return;}
  const max = expenses.reduce((a,b)=>a.amount>b.amount?a:b);
  document.getElementById('insights').innerText=`Highest spending: ${max.category}`;
}

document.getElementById('addBtn').onclick = ()=>{
  if(document.getElementById('role').value!=='admin') return alert('Admin only');
  const newData={
    date:date.value,
    category:category.value,
    amount:Number(amount.value),
    type:type.value
  };
  if(editingIndex!==null){
    transactions[editingIndex] = newData;
    editingIndex = null;
  }else transactions.push(newData);
  localStorage.setItem('data',JSON.stringify(transactions));
  render();
  date.value=''; category.value=''; amount.value=''; type.value='income';
};

function editTransaction(idx){
  const t = transactions[idx];
  date.value=t.date; category.value=t.category; amount.value=t.amount; type.value=t.type;
  editingIndex = idx;
}

function deleteTransaction(idx){
  if(confirm('Are you sure?')){transactions.splice(idx,1);localStorage.setItem('data',JSON.stringify(transactions));render();}
}

document.getElementById('search').oninput=render;
document.getElementById('filterType').onchange=render;
document.getElementById('role').onchange=e=>{adminPanel.style.display=e.target.value==='admin'?'block':'none'; render();};

document.getElementById('darkModeBtn').onclick = ()=>{
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode',document.body.classList.contains('dark'));
};

document.getElementById('exportCsvBtn').onclick = ()=>{
  let csv='Date,Category,Amount,Type\n'+transactions.map(t=>`${t.date},${t.category},${t.amount},${t.type}`).join('\n');
  let a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='transactions.csv'; a.click();
};

document.getElementById('exportJsonBtn').onclick = ()=>{
  let a=document.createElement('a'); a.href='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(transactions,null,2)); a.download='transactions.json'; a.click();
};

// load dark mode preference
if(localStorage.getItem('darkMode')==='true') document.body.classList.add('dark');

render();