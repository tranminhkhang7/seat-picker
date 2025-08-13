import { Component } from '@angular/core';
import { Seat } from './interfaces/seats';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AudienceMember } from './interfaces/audienceMember';
import { TheaterData } from './interfaces/theaterData';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  numRows: number = 14;
  numCols: number = 40;
  seats: Seat[] = [];
  tempAudienceId: string = '';
  assignedAudienceIds: Set<string> = new Set();
  editMode: boolean = false;
  filteredSuggestions: AudienceMember[] = [];

  // Sample audience data - replace with your actual data
  audienceMembers: AudienceMember[] = [
    { id: 'TMKH', name: 'Trần Minh Khang' },
    { id: 'MB789', name: 'Mike Brown' },
    { id: 'DW345', name: 'This is a very long name for testing purpose' },
    { id: 'LT678', name: 'Lisa Taylor' },
    { id: 'RM901', name: 'Robert Miller' },
    { id: 'AM234', name: 'Anna Martinez' },
    { id: 'JG567', name: 'James Garcia' },
    { id: 'MR890', name: 'Maria Rodriguez' },
  ];

  ngOnInit() {
    this.generateSeats();
    this.loadData(); // Auto-load data on startup

    console.log('hehehehe', this.seats);
  }

  generateSeats() {
    this.seats = [];

    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        const rowLabel = String.fromCharCode(65 + row);

        this.seats.push({
          id: `${rowLabel}0`,
          row: row,
          col: col,
          audienceId: null,
          isSelected: false,
          isEditing: false,
          isHidden: false,
          disabled: true,
        });
      }
    }

    this.createSampleLayout();
    this.updateSeatLabels();
    this.setEnabledSeats();
  }

  createSampleLayout() {
    for (let seat of this.seats) {
      const row = seat.row;
      const col = seat.col;

      if (row == 8) {
        seat.isHidden = true;
      }

      if (col >= 8 && col <= 9) {
        seat.isHidden = true;
      }

      if (col >= 30 && col <= 31) {
        seat.isHidden = true;
      }

      if (row <= 6 && (col <= 3 || col >= 36)) {
        seat.isHidden = true;
      }
    }
  }

  updateSeatLabels() {
    for (let row = 0; row < this.numRows; row++) {
      const rowLabel = String.fromCharCode(65 + row);
      const rowSeats = this.seats.filter((seat) => seat.row === row);

      rowSeats.sort((a, b) => a.col - b.col);

      let seatNumber = 1;
      for (let i = rowSeats.length - 1; i >= 0; i--) {
        const seat = rowSeats[i];
        if (!seat.isHidden) {
          seat.id = `${rowLabel}${seatNumber}`;
          seatNumber++;
        } else {
          seat.id = `${rowLabel}0`;
        }
      }
    }
  }

  setEnabledSeats() {
    // G9-20
    for (let col = 9; col <= 20; col++) {
      this.enableSeat('G', col);
    }
    // H13-24, J13-24, K13-24
    ['H', 'J', 'K'].forEach((row) => {
      for (let col = 13; col <= 24; col++) {
        this.enableSeat(row, col);
      }
    });
    // L12-24
    for (let col = 12; col <= 24; col++) {
      this.enableSeat('L', col);
    }
  }

  enableSeat(rowLabel: string, col: number) {
    const seatIdx = `${rowLabel}${col}`;
    const seat = this.seats.find((s) => s.id === seatIdx);
    if (seat) {
      seat.disabled = false;
    }
  }

  getGridTemplate(): string {
    return `repeat(${this.numCols}, 2rem)`;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.resetAllSeats();
    }
  }

  toggleSeatVisibility(seat: Seat) {
    if (this.editMode) {
      if (!seat.isHidden && seat.audienceId) {
        if (confirm('This seat is assigned to someone. Hide it anyway?')) {
          if (seat.audienceId) {
            this.assignedAudienceIds.delete(seat.audienceId);
          }
          seat.audienceId = null;
          seat.isHidden = true;
          this.updateSeatLabels();
        }
      } else {
        seat.isHidden = !seat.isHidden;
        this.updateSeatLabels();
      }
    }
  }

  selectSeat(seat: Seat) {
    if (seat.isHidden) return;
    this.resetAllSeats();
    seat.isSelected = true;
    seat.isEditing = !seat.audienceId;
    this.tempAudienceId = seat.audienceId || '';
    this.filterSuggestions();
    setTimeout(() => {
      if (!seat.audienceId) {
        const input = document.querySelector(
          'input[type="text"]'
        ) as HTMLInputElement;
        if (input) {
          input.focus();
          input.select();
        }
      }
    }, 0);
  }

  filterSuggestions() {
    if (!this.tempAudienceId.trim()) {
      this.filteredSuggestions = [];
      return;
    }

    const query = this.tempAudienceId.toLowerCase();
    this.filteredSuggestions = this.audienceMembers
      .filter(
        (member) =>
          member.id.toLowerCase().includes(query) ||
          member.name.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }

  selectSuggestion(suggestion: AudienceMember, seat: Seat) {
    this.tempAudienceId = suggestion.id;
    this.filteredSuggestions = [];
    this.saveSeat(seat);
  }

  saveSeat(seat: Seat) {
    if (!this.tempAudienceId.trim()) {
      this.removeSeat(seat);
      this.saveData(); // Auto-save after removal
      return;
    }

    const newId = this.tempAudienceId.trim();
    const oldId = seat.audienceId;

    if (oldId !== newId && this.assignedAudienceIds.has(newId)) {
      alert('This audience ID is already assigned to another seat');
      return;
    }

    if (oldId) {
      this.assignedAudienceIds.delete(oldId);
    }

    seat.audienceId = newId;
    seat.isEditing = false;
    seat.isSelected = false;
    this.assignedAudienceIds.add(newId);
    this.tempAudienceId = '';
    this.filteredSuggestions = [];
    this.saveData(); // Auto-save after assignment
  }

  removeSeat(seat: Seat) {
    if (seat.audienceId) {
      this.assignedAudienceIds.delete(seat.audienceId);
    }
    seat.audienceId = null;
    seat.isEditing = false;
    seat.isSelected = false;
    this.tempAudienceId = '';
    this.filteredSuggestions = [];
  }

  cancelEdit(seat: Seat) {
    setTimeout(() => {
      seat.isEditing = false;
      seat.isSelected = false;
      this.tempAudienceId = '';
      this.filteredSuggestions = [];
    }, 100);
  }

  resetAllSeats() {
    this.seats.forEach((seat) => {
      seat.isSelected = false;
      seat.isEditing = false;
    });
    this.filteredSuggestions = [];
  }

  getAudienceName(audienceId: string): string {
    const member = this.audienceMembers.find((m) => m.id === audienceId);
    return member ? member.name : 'Unknown';
  }

  // Data persistence methods
  saveData() {
    const data: TheaterData = {
      numRows: this.numRows,
      numCols: this.numCols,
      seats: this.seats.map((seat) => ({
        ...seat,
        isSelected: false,
        isEditing: false,
      })),
      assignedAudienceIds: Array.from(this.assignedAudienceIds),
    };

    localStorage.setItem('theaterData', JSON.stringify(data));
    alert('Data saved successfully!');
  }

  loadData() {
    const savedData = localStorage.getItem('theaterData');
    if (savedData) {
      try {
        const data: TheaterData = JSON.parse(savedData);
        this.numRows = data.numRows;
        this.numCols = data.numCols;
        this.seats = data.seats;
        this.assignedAudienceIds = new Set(data.assignedAudienceIds);
        console.log('Data loaded successfully!');
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  }

  clearAllSeats() {
    if (confirm('Are you sure you want to clear all seat assignments?')) {
      this.seats.forEach((seat) => {
        seat.audienceId = null;
        seat.isSelected = false;
        seat.isEditing = false;
      });
      this.assignedAudienceIds.clear();
      this.saveData();
    }
  }

  exportSeatingChart() {
    const assignedSeats = this.seats.filter(
      (seat) => !seat.isHidden && seat.audienceId
    );

    let csvContent = 'Seat ID,Audience ID,Name\n';
    assignedSeats.forEach((seat) => {
      const name = this.getAudienceName(seat.audienceId!);
      csvContent += `${seat.id},${seat.audienceId},${name}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seating-chart-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Statistics methods
  // getAvailableSeats(): number {
  //   return this.seats.filter((seat) => !seat.isHidden && !seat.audienceId)
  //     .length;
  // }

  getTakenSeats(): number {
    return this.seats.filter((seat) => !seat.isHidden && seat.audienceId)
      .length;
  }

  getVisibleSeats(): number {
    return this.seats.filter((seat) => !seat.isHidden).length;
  }

  getHiddenSeats(): number {
    return this.seats.filter((seat) => seat.isHidden).length;
  }
}
