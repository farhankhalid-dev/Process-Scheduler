`use strict`;

function resetFields() {
	document.getElementById("numProcesses").value = "0";
	document.getElementById("processInputs").innerHTML = "";
	document.getElementById("algorithm").value = "FCFS";
	document.getElementById("quantum").value = "";
	document.getElementById("ganttChart").innerHTML = "";
	document.getElementById("resultsTable").innerHTML = "";
	document.getElementById("quantumField").style.display = "none";
}

function generateInputs() {
	const numProcesses = parseInt(document.getElementById("numProcesses").value);
	const processInputs = document.getElementById("processInputs");
	const algorithm = document.getElementById("algorithm").value;

	for (let i = 0; i < processInputs.children.length; i++) {
		if (i >= numProcesses) {
			processInputs.children[i].remove();
			i--;
		}
	}

	for (let i = processInputs.children.length; i < numProcesses; i++) {
		const div = document.createElement("div");
		div.classList.add("input-row");

		const nameInput = document.createElement("input");
		nameInput.type = "text";
		nameInput.id = `name${i}`;
		nameInput.placeholder = "Process Name";
		nameInput.required = true;
		nameInput.value = `P${i + 1}`;

		const burstInput = document.createElement("input");
		burstInput.type = "number";
		burstInput.id = `burst${i}`;
		burstInput.min = 1;
		burstInput.placeholder = "Burst Time";
		burstInput.required = true;

		const arrivalInput = document.createElement("input");
		arrivalInput.type = "number";
		arrivalInput.id = `arrival${i}`;
		arrivalInput.min = 0;
		arrivalInput.placeholder = "Arrival Time";
		arrivalInput.required = true;

		div.appendChild(nameInput);
		div.appendChild(burstInput);
		div.appendChild(arrivalInput);

		if (algorithm === "Priority") {
			const priorityInput = document.createElement("input");
			priorityInput.type = "number";
			priorityInput.id = `priority${i}`;
			priorityInput.placeholder = "Priority";
			priorityInput.required = true;
			div.appendChild(priorityInput);
		}1

		processInputs.appendChild(div);
	}

	toggleFields();
}

function toggleFields() {
	const algorithm = document.getElementById("algorithm").value;
	const numProcesses = parseInt(document.getElementById("numProcesses").value);
	const processInputs = document.getElementById("processInputs");
	const quantumField = document.getElementById("quantumField");

	if (algorithm === "Priority") {
		for (let i = 0; i < numProcesses; i++) {
			let priorityInput = document.getElementById(`priority${i}`);
			if (!priorityInput) {
				priorityInput = document.createElement("input");
				priorityInput.type = "number";
				priorityInput.id = `priority${i}`;
				priorityInput.placeholder = "Priority";
				priorityInput.required = true;
				processInputs.children[i].appendChild(priorityInput);
			}
		}
		quantumField.style.display = "none";
	} else if (algorithm === "RR") {
		quantumField.style.display = "block";
		for (let i = 0; i < numProcesses; i++) {
			const priorityInput = document.getElementById(`priority${i}`);
			if (priorityInput) {
				priorityInput.remove();
			}
		}
	} else {
		quantumField.style.display = "none";
		for (let i = 0; i < numProcesses; i++) {
			const priorityInput = document.getElementById(`priority${i}`);
			if (priorityInput) {
				priorityInput.remove();
			}
		}
	}
}

function solve() {
	const algorithm = document.getElementById("algorithm").value;
	const numProcesses = parseInt(document.getElementById("numProcesses").value);
	const quantum = parseInt(document.getElementById("quantum").value);
	let processes = [];

	if (numProcesses === 0) {
		alert("Please enter the number of processes.");
		return;
	}

	for (let i = 0; i < numProcesses; i++) {
		const name = document.getElementById(`name${i}`).value;
		const burst = parseInt(document.getElementById(`burst${i}`).value);
		const arrival = parseInt(document.getElementById(`arrival${i}`).value);
		const priority =
			algorithm === "Priority"
				? parseInt(document.getElementById(`priority${i}`).value)
				: 0;

		if (
			isNaN(burst) ||
			isNaN(arrival) ||
			(algorithm === "Priority" && isNaN(priority)) ||
			!name
		) {
			alert("Please enter valid inputs for all fields.");
			return;
		}

		processes.push({
			id: name,
			burst,
			arrival,
			priority,
			remaining: burst,
			completed: false,
			waiting: 0,
			turnaround: 0,
			finish: 0,
		});
	}

	let ganttChart = [];
	let time = 0;
	let completedProcesses = 0;
	let readyQueue = [];

	const addIdleTime = () => {
		if (
			ganttChart.length === 0 ||
			ganttChart[ganttChart.length - 1].process !== "IDLE"
		) {
			ganttChart.push({ process: "IDLE", start: time, end: time + 1 });
		} else {
			ganttChart[ganttChart.length - 1].end++;
		}
	};

	if (algorithm === "FCFS") {
		processes.sort((a, b) => a.arrival - b.arrival);
		while (completedProcesses < numProcesses) {
			let process = processes.find((p) => !p.completed && p.arrival <= time);
			if (process) {
				ganttChart.push({
					process: process.id,
					start: time,
					end: time + process.burst,
				});
				time += process.burst;
				process.completed = true;
				process.finish = time;
				completedProcesses++;
			} else {
				addIdleTime();
				time++;
			}
		}
	} else if (algorithm === "SJF") {
    while (completedProcesses < numProcesses) {
        let process = processes
            .filter((p) => p.arrival <= time && !p.completed)
            .sort((a, b) => {
                if (a.burst === b.burst) {
                    return a.arrival - b.arrival;
                }
                return a.burst - b.burst;
            })[0];

        if (process) {
            ganttChart.push({
                process: process.id,
                start: time,
                end: time + process.burst,
            });
            time += process.burst;
            process.completed = true;
            process.finish = time;
            completedProcesses++;
        } else {
            addIdleTime();
            time++;
        }
    }
} else if (algorithm === "Priority") {
    while (completedProcesses < numProcesses) {
        let process = processes
            .filter((p) => p.arrival <= time && !p.completed)
            .sort((a, b) => {
                if (a.priority === b.priority) {
                    return a.arrival - b.arrival;
                }
                return a.priority - b.priority;
            })[0];

        if (process) {
            ganttChart.push({
                process: process.id,
                start: time,
                end: time + process.burst,
            });
            time += process.burst;
            process.completed = true;
            process.finish = time;
            completedProcesses++;
        } else {
            addIdleTime();
            time++;
        }
    }
}
 else if (algorithm === 'RR') {
    // Sort processes by arrival time initially
    processes.sort((a, b) => a.arrival - b.arrival);

    let currentProcessIndex = 0;

    while (completedProcesses < numProcesses) {
        let found = false;

        for (let i = 0; i < numProcesses; i++) {
            let process = processes[(currentProcessIndex + i) % numProcesses];

            if (process.arrival <= time && process.remaining > 0) {
                found = true;
                if (process.remaining > quantum) {
                    ganttChart.push({ process: process.id, start: time, end: time + quantum });
                    time += quantum;
                    process.remaining -= quantum;
                } else {
                    ganttChart.push({ process: process.id, start: time, end: time + process.remaining });
                    time += process.remaining;
                    process.remaining = 0;
                    process.completed = true;
                    process.finish = time;
                    completedProcesses++;
                }
                currentProcessIndex = (currentProcessIndex + i + 1) % numProcesses;
                break;
            }
        }

        if (!found) {
            addIdleTime();
            time++;
        }
    }
}
	processes.forEach((p) => {
		p.turnaround = p.finish - p.arrival;
		p.waiting = p.turnaround - p.burst;
	});

	const resultObject = {
		ganttChart: [...ganttChart],
		processes: [...processes],
	};

	displayGanttChart(resultObject.ganttChart);
	displayResultsTable(resultObject.processes, algorithm);
}

function displayGanttChart(ganttChart) {
	const ganttChartDiv = document.getElementById("ganttChart");
	ganttChartDiv.innerHTML = "<h2>Gantt Chart</h2>";

	const ganttChartContainer = document.createElement("div");
	ganttChartContainer.id = "ganttChartContainer";

	ganttChart.forEach((block, index) => {
		const ganttBar = document.createElement("div");
		ganttBar.className = "gantt-bar";
		ganttBar.style.width = `${(block.end - block.start) * 20}px`;
		ganttBar.style.backgroundColor =
			block.process === "IDLE"
				? "red"
				: index % 2 === 0
				? "#007bff"
				: "#0054ad";
		ganttBar.innerText = block.process;

		const startTime = document.createElement("div");
		startTime.className = "time-label";
		startTime.style.left = "0";
		startTime.innerText = block.start;

		const endTime = document.createElement("div");
		endTime.className = "time-label";
		endTime.style.right = "0";
		endTime.innerText = block.end;

		ganttBar.appendChild(startTime);
		ganttBar.appendChild(endTime);
		ganttChartContainer.appendChild(ganttBar);
	});

	ganttChartContainer.style.height = "64px";
	ganttChartContainer.style.marginTop = "-10px";

	ganttChartDiv.appendChild(ganttChartContainer);
}

function displayResultsTable(processes, algorithm) {
	const resultsTableDiv = document.getElementById("resultsTable");
	resultsTableDiv.innerHTML = "<h2>Results</h2>";

	let table = "<table>";
	table += "<tr><th>Process</th><th>Burst Time</th><th>Arrival Time</th>";
	if (algorithm === "Priority") {
		table += "<th>Priority</th>";
	}
	table += "<th>Turnaround Time</th><th>Waiting Time</th></tr>";

	let totalTurnaround = 0;
	let totalWaiting = 0;

	processes.forEach((p) => {
		table += `<tr><td>${p.id}</td><td>${p.burst}</td><td>${p.arrival}</td>`;
		if (algorithm === "Priority") {
			table += `<td>${p.priority}</td>`;
		}
		table += `<td>${p.turnaround}</td><td>${p.waiting}</td></tr>`;
		totalTurnaround += p.turnaround;
		totalWaiting += p.waiting;
	});

	const avgTurnaround = (totalTurnaround / processes.length).toFixed(2);
	const avgWaiting = (totalWaiting / processes.length).toFixed(2);

	table += `<tr><td colspan="${algorithm === "Priority" ? 4 : 3}">Average</td>`;
	table += `<td>${avgTurnaround}</td><td>${avgWaiting}</td></tr>`;

	table += "</table>";
	resultsTableDiv.innerHTML += table;
}

function displayGanttChart(ganttChart) {
	const ganttChartDiv = document.getElementById("ganttChart");
	ganttChartDiv.innerHTML = "<h2>Gantt Chart</h2>";

	const ganttChartContainer = document.createElement("div");
	ganttChartContainer.id = "ganttChartContainer";

	ganttChart.forEach((block, index) => {
		const ganttBar = document.createElement("div");
		ganttBar.className = "gantt-bar";
		ganttBar.style.width = `${(block.end - block.start) * 20}px`;
		ganttBar.style.backgroundColor =
			block.process === "IDLE"
				? "red"
				: index % 2 === 0
				? "#007bff"
				: "#0054ad";
		ganttBar.innerText = block.process;

		const startTime = document.createElement("div");
		startTime.className = "time-label";
		startTime.style.left = "0";
		startTime.innerText = block.start;

		const endTime = document.createElement("div");
		endTime.className = "time-label";
		endTime.style.right = "0";
		endTime.innerText = block.end;

		ganttBar.appendChild(startTime);
		ganttBar.appendChild(endTime);
		ganttChartContainer.appendChild(ganttBar);
	});

	ganttChartContainer.style.height = "64px";
	ganttChartContainer.style.marginTop = "-10px";

	ganttChartDiv.appendChild(ganttChartContainer);
}

function displayResultsTable(processes, algorithm) {
  const resultsTableDiv = document.getElementById("resultsTable");
  resultsTableDiv.innerHTML = "<h2>Results</h2>";

  let table = "<table>";
  table += "<tr><th>Process</th><th>Burst Time</th><th>Arrival Time</th>";
  if (algorithm === "Priority") {
      table += "<th>Priority</th>";
  }
  table += "<th>Turnaround Time</th><th>Waiting Time</th></tr>";

  let totalTurnaround = 0;
  let totalWaiting = 0;
  let totalBurst = 0;
  let totalExecutionTime = 0;

  // Calculate total burst time of all processes
  processes.forEach((p) => {
      totalBurst += p.burst;
  });

  // Calculate turnaround and waiting times, and build the table rows
  processes.forEach((p) => {
      totalTurnaround += p.turnaround;
      totalWaiting += p.waiting;
      table += `<tr class="${p.id}"><td>${p.id}</td><td>${p.burst}</td><td>${p.arrival}</td>`;
      if (algorithm === "Priority") {
          table += `<td>${p.priority}</td>`;
      }
      table += `<td>${p.turnaround}</td><td>${p.waiting}</td></tr>`;
  });

  // Calculate CPU utilization percentage
  totalExecutionTime = processes[processes.length - 1].finish;
  const cpuUtilization = ((totalBurst / totalExecutionTime) * 100).toFixed(2);

  const avgTurnaround = (totalTurnaround / processes.length).toFixed(2);
  const avgWaiting = (totalWaiting / processes.length).toFixed(2);

  table += `<tr><td colspan="${algorithm === "Priority" ? 4 : 3}">Average</td>`;
  table += `<td>${avgTurnaround}</td><td>${avgWaiting}</td></tr>`;

  table += `<tr><td colspan="${algorithm === "Priority" ? 4 : 3}">CPU Utilization (%)</td>`;
  table += `<td colspan="2">${cpuUtilization}</td></tr>`;

  table += "</table>";
  resultsTableDiv.innerHTML += table;
}