// Wait for the page to load before creating charts
document.addEventListener("DOMContentLoaded", function () {

  // 1. BAR CHART - Stock In and Stock Out each month
  new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Stock In",
          data: [120, 190, 300, 250, 220, 260],
          backgroundColor: "#38bdf8"   
        },
        {
          label: "Stock Out",
          data: [80, 140, 200, 180, 160, 210],
          backgroundColor: "#6366f1"    
        }
      ]
    },
    options: {
      responsive: true   
    }
  });

  // 2. DONUT CHART - Stock Status (In Stock, Low, Out)
 new Chart(document.getElementById("donutChart"), {
  type: "doughnut",
  data: {
    labels: ["In Stock", "Low", "Out"],
    datasets: [{
      data: [55, 25, 20],
      backgroundColor: [
        "#22c55e",  
        "#facc15",  
        "#ef4444"   
      ],
      borderColor: "#ffffff",
      borderWidth: 3,           
      hoverBorderWidth: 5,
      borderRadius: 10          
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,  
    cutout: "55%",              
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 13,
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "rectRounded",
          color: "#333"
        }
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            let value = context.parsed;
            let total = context.dataset.data.reduce((a, b) => a + b, 0);
            let percentage = Math.round((value / total) * 100);
            return `${label}: ${value} items (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200
    }
  }
});
  // 3. LINE CHART - Items sold each day of the week
  new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Items",
        data: [40, 60, 55, 70, 65, 80, 90],
        borderColor: "#2563eb",   
        tension: 0.4              
      }]
    },
    options: {
      responsive: true
    }
  });

  // 4. MINI CHART - Small trend line (white line, no text)
  new Chart(document.getElementById("miniChart"), {
    type: "line",
    data: {
      datasets: [{
        data: [20, 40, 30, 50, 45, 60, 55],
        borderColor: "#ffffff",  
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }   
      },
      scales: {
        x: { display: false },      
        y: { display: false }      
      }
    }
  });

});