"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const repo_1 = require("./repo");
const seedDatabase = async () => {
    try {
        const problems = await repo_1.Repo.listProblems();
        if (problems.length > 0) {
            console.log('Database already has seeded problems. Skipping seeder.');
            return;
        }
        console.log('Seeding initial data into database...');
        // 1. Seed Problems
        const p1 = await repo_1.Repo.createProblem({
            title: 'Two Sum',
            slug: 'two-sum',
            description: 'Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to `target`*.\n\nYou may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.\n\nYou can return the answer in any order.',
            difficulty: 'Easy',
            category: 'Arrays',
            constraints: [
                '2 <= nums.length <= 10^4',
                '-10^9 <= nums[i] <= 10^9',
                '-10^9 <= target <= 10^9',
                'Only one valid answer exists.'
            ],
            examples: [
                {
                    input: 'nums = [2,7,11,15], target = 9',
                    output: '[0,1]',
                    explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1].'
                }
            ],
            hints: [
                'A really brute force way would be to search for all possible pairs of numbers but that would be O(N^2). Can we do better?',
                'Try using a Hash Map to store elements and look up the complement in O(1) time complexity.'
            ],
            editorial: 'To solve Two Sum in O(N) time, use a Hash Map. For each element `nums[i]`, compute its complement `target - nums[i]`. If the complement exists in the map, return the current index `i` and the stored index. Otherwise, add `nums[i]` to the map with its index `i`.',
            tags: ['Array', 'Hash Table'],
            starterTemplates: [
                {
                    language: 'javascript',
                    code: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your code here\n    \n}'
                },
                {
                    language: 'typescript',
                    code: 'function twoSum(nums: number[], target: number): number[] {\n    // Write your code here\n    return [];\n}'
                },
                {
                    language: 'python',
                    code: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass'
                },
                {
                    language: 'cpp',
                    code: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};'
                },
                {
                    language: 'java',
                    code: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}'
                }
            ],
            testCases: [
                { input: '2 7 11 15\n9', expectedOutput: '[0,1]', isHidden: false },
                { input: '3 2 4\n6', expectedOutput: '[1,2]', isHidden: false },
                { input: '3 3\n6', expectedOutput: '[0,1]', isHidden: true }
            ]
        });
        const p2 = await repo_1.Repo.createProblem({
            title: 'Reverse String',
            slug: 'reverse-string',
            description: 'Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array **in-place** with `O(1)` extra memory.',
            difficulty: 'Easy',
            category: 'Strings',
            constraints: [
                '1 <= s.length <= 10^5',
                's[i] is a printable ascii character.'
            ],
            examples: [
                {
                    input: 's = ["h","e","l","l","o"]',
                    output: '["o","l","l","e","h"]',
                    explanation: 'Input string is reversed in-place.'
                }
            ],
            hints: [
                'Do not allocate extra space for another array. You must modify the input array in-place.',
                'Use two pointers approach. Swap characters at left and right indices, then move pointers closer.'
            ],
            editorial: 'Utilize two pointers starting at index `0` (left) and `s.length - 1` (right). Swap `s[left]` and `s[right]`, increment left pointer, and decrement right pointer. Repeat until the pointers meet.',
            tags: ['Two Pointers', 'String'],
            starterTemplates: [
                {
                    language: 'javascript',
                    code: '/**\n * @param {string[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nfunction reverseString(s) {\n    // Write your code here\n    \n}'
                },
                {
                    language: 'typescript',
                    code: 'function reverseString(s: string[]): void {\n    // Write your code here\n    \n}'
                },
                {
                    language: 'python',
                    code: 'class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        # Do not return anything, modify s in-place instead.\n        pass'
                }
            ],
            testCases: [
                { input: 'h e l l o', expectedOutput: 'o l l e h', isHidden: false },
                { input: 'H a n n a h', expectedOutput: 'h a n n a H', isHidden: true }
            ]
        });
        const p3 = await repo_1.Repo.createProblem({
            title: 'Palindrome Number',
            slug: 'palindrome-number',
            description: 'Given an integer `x`, return `true` if `x` is a **palindrome**, and `false` otherwise.\n\nAn integer is a **palindrome** when it reads the same backward as forward. For example, `121` is a palindrome while `123` is not.',
            difficulty: 'Easy',
            category: 'Sorting',
            constraints: [
                '-2^31 <= x <= 2^31 - 1'
            ],
            examples: [
                {
                    input: 'x = 121',
                    output: 'true',
                    explanation: '121 reads as 121 from left to right and from right to left.'
                }
            ],
            hints: [
                'Beware of negative numbers. For example, -121 reads as 121- which is not a palindrome.',
                'Could you solve it without converting the integer to a string?'
            ],
            editorial: 'Negative numbers cannot be palindromes. For non-negative integers, we can reverse the second half of the number and compare it with the first half to avoid integer overflow issues.',
            tags: ['Math'],
            starterTemplates: [
                {
                    language: 'javascript',
                    code: '/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n    // Write your code here\n    \n}'
                },
                {
                    language: 'typescript',
                    code: 'function isPalindrome(x: number): boolean {\n    // Write your code here\n    return false;\n}'
                },
                {
                    language: 'python',
                    code: 'class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        # Write your code here\n        pass'
                }
            ],
            testCases: [
                { input: '121', expectedOutput: 'true', isHidden: false },
                { input: '-121', expectedOutput: 'false', isHidden: false },
                { input: '10', expectedOutput: 'false', isHidden: true }
            ]
        });
        // 2. Seed default contests
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        await repo_1.Repo.createContest({
            title: 'Weekly Contest #42',
            description: 'Test your skills in our weekly competition against global engineers. Complete 3 tasks to improve your profile rating.',
            startTime: tomorrow.toISOString(),
            endTime: dayAfter.toISOString(),
            problems: [p1._id || p1.id, p2._id || p2.id, p3._id || p3.id],
            participants: [],
            leaderboard: [
                { rank: 1, username: 'competitive_coder', score: 300, timeTaken: 22 },
                { rank: 2, username: 'algo_master', score: 200, timeTaken: 15 },
                { rank: 3, username: 'quick_solver', score: 100, timeTaken: 5 }
            ]
        });
        // 3. Seed default discussion thread
        // Mock user id
        const mockAuthorId = '66580f12be7c86a111223344';
        await repo_1.Repo.createDiscussion({
            title: 'How to prepare for Google L4 Software Engineering interview',
            content: 'I recently cleared the Google L4 frontend/full-stack round. Here are the core topics you should focus on:\n1. Graphs and BFS/DFS (standard questions on tree traversals and cycles)\n2. System Design: Caching, Rate limiting, and WebSockets consistency\n3. Redux Toolkit vs Context optimization\n\nFeel free to ask any specific questions in the thread!',
            category: 'Interviews',
            author: mockAuthorId,
            upvotes: [],
            downvotes: [],
            comments: [
                {
                    author: mockAuthorId,
                    content: 'Congratulations! Did they ask any system design questions about WebSocket servers?',
                    upvotes: [],
                    downvotes: [],
                    createdAt: new Date().toISOString()
                }
            ],
            reputationPoints: 10
        });
        console.log('Database seeded successfully!');
    }
    catch (error) {
        console.error('Failed to seed database:', error);
    }
};
exports.seedDatabase = seedDatabase;
