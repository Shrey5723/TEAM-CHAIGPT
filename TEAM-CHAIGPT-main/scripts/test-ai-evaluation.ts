// Test script to diagnose AI evaluation workflow
import 'dotenv/config';
import { aiEvaluationService } from '../src/services/ai-evaluation.service';

const API_KEY = process.env.OPENROUTER_API_KEY;
console.log('='.repeat(60));
console.log('AI EVALUATION WORKFLOW DIAGNOSTIC TEST (OPENROUTER)');
console.log('='.repeat(60));
console.log('\n📌 API Key:', API_KEY ? `${API_KEY.slice(0, 10)}...` : '❌ NOT FOUND');

if (!API_KEY) {
    console.error('❌ OPENROUTER_API_KEY not found in .env');
    process.exit(1);
}

// Test certificate data
const testCourses = [
    {
        name: 'Deep Learning Specialization',
        platform: 'Coursera',
        provider: 'deeplearning.ai'
    },
    {
        name: 'Machine Learning Specialization',
        platform: 'Coursera',
        provider: 'Stanford University'
    },
    {
        name: 'AWS Solutions Architect',
        platform: 'Udemy',
        provider: 'Stephane Maarek'
    }
];

async function testEvaluation(course: { name: string; platform: string; provider: string }) {
    console.log('\n' + '-'.repeat(60));
    console.log(`📚 Testing: ${course.name}`);
    console.log(`   Platform: ${course.platform} | Provider: ${course.provider}`);
    console.log('-'.repeat(60));

    try {
        console.log('🔄 Calling OpenRouter API via AIEvaluationService...');
        const startTime = Date.now();

        // Use the actual service
        const result = await aiEvaluationService.evaluateCourse(course.name, course.platform, course.provider);

        const responseTime = Date.now() - startTime;
        console.log(`⏱️  Response time: ${responseTime}ms`);

        console.log('\n✅ Evaluation Successful!');
        console.log('📊 Evaluation Results:');
        console.log(`   Overall Rating (R): ${result.overall_rating_R}/10`);
        console.log(`   Real-Life Application (A): ${result.real_life_application_A}/10`);
        console.log(`   Skills Identified: ${result.skills.length}`);
        console.log(`   Final Score: ${result.final_score}/100`);

        console.log('\n📋 Skills Breakdown:');
        for (const skill of result.skills) {
            console.log(`   • ${skill.skill_name}: ${skill.skill_rating_Si}/10`);
        }

        console.log(`\n💡 Evaluation Notes: ${result.evaluation_notes}`);

        return {
            success: true,
            course: course.name,
            finalScore: result.final_score,
            confidence: result.final_score / 100,
            skillCount: result.skills.length
        };

    } catch (error: any) {
        console.log('\n❌ ERROR:');
        console.log(`   Message: ${error.message}`);
        return { success: false, course: course.name, error: error.message };
    }
}

async function runDiagnostics() {
    console.log('\n🚀 Starting diagnostics...\n');

    const results = [];
    for (const course of testCourses) {
        const result = await testEvaluation(course);
        results.push(result);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Successful: ${successCount}/${results.length}`);

    if (successCount > 0) {
        console.log('\n📈 Score Analysis:');
        for (const r of results.filter(r => r.success)) {
            console.log(`   ${r.course}: ${(r.finalScore || 0).toFixed(2)}/100 (${r.skillCount || 0} skills)`);
        }
    }

    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
        console.log('\n❌ Failed Evaluations:');
        for (const f of failures) {
            console.log(`   ${f.course}: ${f.error}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('DIAGNOSTIC COMPLETE');
    console.log('='.repeat(60));
}

runDiagnostics().catch(console.error);
